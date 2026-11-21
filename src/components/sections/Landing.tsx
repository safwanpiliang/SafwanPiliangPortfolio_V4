import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, Leaf, Sun } from 'lucide-react'
import { projects } from '../../data/content'
import { Button } from '../ui/Button'
import { ScrambleWords } from '../effects/ScrambleWords'
import type { LandingScene, RingCard, Season } from '../../three/landingScene'

const ease = [0.22, 1, 0.36, 1] as const
const TRANSITION_MS = 2400 // landing → showcase, played in one go
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
// Scramble cycles through these and settles on the last
const headingWords = ['Interfaces', 'Identities', 'Characters', 'Experiences']
const showcaseWords = ['Brands', 'Interfaces', 'Worlds', 'Visions']
// Covers on the ring around the character: the most colourful ones (ranked by colourfulness × brightness), ordered so
// neighbouring cards differ in hue
const ringIds = [
  'kmid',
  'batam-campus-expo',
  'vocentic',
  'liga-trpl',
  'habitutor',
  'pionir',
  'gadani',
  'tges',
]
const ringCards: RingCard[] = ringIds.flatMap((id) =>
  projects
    .filter((p) => p.cover.endsWith(`/${id}.webp`))
    .map((p) => ({
      cover: p.cover,
      title: p.title,
      href: p.behance ?? p.live ?? p.medium ?? p.instagram,
    })),
)

function ShowcaseCopy({ revealed }: { revealed: boolean }) {
  return (
    <>
      <p className="text-xl font-medium tracking-[-0.03em] md:text-[34px]">Trusted to Bring</p>
      <h2 className="mt-1 text-[38px] leading-[1.05] font-semibold tracking-[-0.045em] md:text-[64px] xl:text-[76px]">
        Countless <ScrambleWords words={showcaseWords} start={revealed} reserve={false} /> to Life
      </h2>
    </>
  )
}

/**
 * Sections 1 and 2 in one pinned three.js scene. Landing: Arumbae Neira grass hill with the Chibi character sitting on it,
 * behind the intro copy. While the user scrolls, the camera turns around the character and the hill breaks into
 * particles that re-form as the showcase: the character standing in a ring of project cards, under the section 2 copy.
 * Reduced motion: no pin and no transition; the landing shows as a still frame, followed by a still of the showcase.
 */
export function Landing({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [sceneReady, setSceneReady] = useState(false)
  const [revealed, setRevealed] = useState(still)
  const [snapshot, setSnapshot] = useState<string>()
  const [season, setSeason] = useState<Season>('autumn') // keep in sync with the scene's starting season
  const sceneRef = useRef<LandingScene>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let io: IntersectionObserver | undefined
    // three.js lives in its own chunk, loaded only for this section
    import('../../three/landingScene')
      .then(({ createLandingScene }) =>
        createLandingScene(canvas, {
          lite: window.matchMedia('(max-width: 767px), (pointer: coarse)').matches,
          still,
          cards: ringCards,
        }),
      )
      .then((s) => {
        if (disposed) return s.dispose()
        sceneRef.current = s
        setSceneReady(true)
        if (still) setSnapshot(s.snapshot())
        // stop rendering while the scene is off screen
        io = new IntersectionObserver(([e]) => s.setActive(e.isIntersecting))
        io.observe(sectionRef.current!)
      })
      .catch((err) => console.error('Landing scene failed to load', err)) // the paper background and copy still show
    return () => {
      disposed = true
      io?.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = undefined
    }
  }, [still])

  // The transition plays on its own once triggered, so a visitor can never come to rest halfway, in the particle cloud.
  // At the top of the page, a scroll down (wheel, swipe or key) plays it forward; while it plays, scrolling is held; a
  // scroll up at the top plays it back. Any other way of leaving the top (anchor link, scrollbar) jumps to the end.
  // Styles are written straight to the DOM so the animation doesn't re-render React.
  useEffect(() => {
    if (still) return
    let p = scrollY > 1 ? 1 : 0,
      from = p,
      to = p,
      t0 = 0,
      raf = 0
    const apply = (v: number) => {
      sceneRef.current?.setProgress(v)
      const out = 1 - smooth(0.02, 0.2, v),
        inn = smooth(0.72, 0.92, v)
      for (const el of [copyRef.current, toggleRef.current])
        if (el) {
          el.style.opacity = String(out)
          el.style.visibility = out < 0.02 ? 'hidden' : ''
        }
      if (copyRef.current) copyRef.current.style.transform = `translateY(${(1 - out) * -24}px)`
      const show = showcaseRef.current
      if (show) {
        show.style.opacity = String(inn)
        show.style.visibility = inn < 0.02 ? 'hidden' : 'visible' // overrides the initial invisible class
        show.style.transform = `translateY(${(1 - inn) * 24}px)`
      }
      if (v > 0.8) setRevealed(true)
    }
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / TRANSITION_MS)
      p = from + (to - from) * (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2) // ease in-out
      apply(p)
      raf = k < 1 ? requestAnimationFrame(tick) : 0
    }
    const play = (target: number) => {
      from = p
      to = target
      t0 = performance.now()
      raf = requestAnimationFrame(tick)
    }
    // dir: 1 = towards the page below, -1 = back up
    const intent = (e: Event, dir: number) => {
      if (raf) return e.cancelable && e.preventDefault() // hold the page while it plays
      if (scrollY > 1) return
      if ((dir > 0 && to === 0) || (dir < 0 && to === 1)) {
        if (e.cancelable) e.preventDefault()
        play(dir > 0 ? 1 : 0)
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (raf) e.preventDefault()
      else if (e.deltaY) intent(e, Math.sign(e.deltaY)) // even a tiny trackpad nudge, or it would scroll past
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY
      if (raf) e.preventDefault()
      else if (Math.abs(dy) > 10) intent(e, Math.sign(dy))
      else if (dy > 0 && to === 0 && scrollY <= 1 && e.cancelable) e.preventDefault() // don't let the page creep
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)
      if (down || up) intent(e, down ? 1 : -1)
    }
    const onScroll = () => {
      if (scrollY <= 1 || to === 1) return
      // a small scroll that slipped through still plays the transition; a far jump (anchor, scrollbar) skips to the end
      if (scrollY < innerHeight / 2) return raf || play(1)
      cancelAnimationFrame(raf)
      raf = 0
      p = from = to = 1
      apply(1)
    }
    apply(p)
    const opts = { passive: false }
    addEventListener('wheel', onWheel, opts)
    addEventListener('touchstart', onTouchStart, { passive: true })
    addEventListener('touchmove', onTouchMove, opts)
    addEventListener('keydown', onKey)
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('wheel', onWheel)
      removeEventListener('touchstart', onTouchStart)
      removeEventListener('touchmove', onTouchMove)
      removeEventListener('keydown', onKey)
      removeEventListener('scroll', onScroll)
    }
  }, [still, sceneReady])

  const pickSeason = (next: Season) => {
    setSeason(next)
    sceneRef.current?.setSeason(next)
  }

  // Project cards on the ring: highlight under the pointer, open the project on click
  const cardAt = (e: PointerEvent | MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas || !sceneRef.current) return
    const r = canvas.getBoundingClientRect()
    return sceneRef.current.pick(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    )
  }
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const card = (e.target as HTMLElement).closest('a, button') ? undefined : cardAt(e)
    e.currentTarget.style.cursor = card?.href ? 'pointer' : ''
    e.currentTarget.title = card?.title ?? ''
  }
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    const href = cardAt(e)?.href
    if (href) window.open(href, '_blank', 'noopener')
  }

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, delay, ease },
  })

  const landing = (
    <section
      ref={sectionRef}
      id="top"
      // Paper + soft glow until the canvas takes over (it draws the same background, three/post.ts)
      className={`relative h-[100svh] min-h-[560px] overflow-hidden bg-paper bg-[radial-gradient(ellipse_60%_45%_at_50%_72%,#ffffff_0%,transparent_70%)]`}
      onPointerMove={still ? undefined : onPointerMove}
      onPointerLeave={still ? undefined : () => sceneRef.current?.pick(9, 9)}
      onClick={still ? undefined : onClick}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-1000 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={copyRef}
        className="relative z-10 flex flex-col items-center px-5 pt-[16svh] text-center md:pt-[15svh]"
      >
        <motion.span
          {...show(0)}
          className="rounded-full bg-soft px-3 py-1 text-[9.5px] font-medium tracking-[0.08em] whitespace-nowrap text-mute uppercase sm:px-4 sm:py-1.5 sm:text-[12px] sm:tracking-[0.14em]"
        >
          Product &amp; Brand Designer — Yogyakarta-Jakarta, ID
        </motion.span>
        <motion.h1
          {...show(0.1)}
          className="mt-8 text-[52px] leading-[0.92] font-medium tracking-[-0.055em] md:mt-10 md:text-[96px] xl:text-[120px]"
        >
          Crafting Digital
          <br />
          <ScrambleWords words={headingWords} start={ready} delay={1600} />
        </motion.h1>
        <motion.p
          {...show(0.2)}
          className="mt-5 text-xl tracking-[-0.02em] text-mute md:mt-7 md:text-[40px]"
        >
          across UI, Graphic Design, and 3D
        </motion.p>
        <motion.div
          {...show(0.3)}
          className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:gap-8 md:mt-12"
        >
          <Button
            href="#projects"
            icon={<ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />}
          >
            View selected work
          </Button>
          <Button href="#insights" variant="text" icon="arrow">
            Read my articles
          </Button>
        </motion.div>
      </div>

      {!still && (
        <div
          ref={showcaseRef}
          className="pointer-events-none invisible absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5 pt-[17svh] text-center opacity-0"
        >
          <ShowcaseCopy revealed={revealed} />
        </div>
      )}

      {sceneReady && (
        <div
          ref={toggleRef}
          role="group"
          aria-label="Season"
          className="absolute right-5 bottom-5 z-10 flex rounded-full border border-line bg-white/80 p-1 text-[13px] font-medium shadow-[0_8px_24px_-12px_rgba(17,17,17,0.25)] backdrop-blur-sm md:right-8 md:bottom-8"
        >
          {(
            [
              ['summer', 'Summer', Sun],
              ['autumn', 'Autumn', Leaf],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={season === id}
              onClick={() => pickSeason(id)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 transition-colors ${
                season === id ? 'bg-ink text-paper' : 'text-mute hover:text-ink'
              }`}
            >
              <Icon aria-hidden className="size-3.5" strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      )}
    </section>
  )

  if (still)
    return (
      <>
        {landing}
        <section className="relative h-[100svh] min-h-[560px] overflow-hidden bg-paper">
          {snapshot && (
            <img src={snapshot} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          <div className="pointer-events-none relative z-10 flex flex-col items-center px-5 pt-[17svh] text-center">
            <ShowcaseCopy revealed />
          </div>
        </section>
      </>
    )

  return landing
}
