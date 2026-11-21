import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, Leaf, Sun } from 'lucide-react'
import { profile, projects } from '../../data/content'
import { Button } from '../ui/Button'
import { ScrambleWords } from '../effects/ScrambleWords'
import type { LandingScene, RingCard, Season } from '../../three/landingScene'

const ease = [0.22, 1, 0.36, 1] as const
const TRANSITION_VH = 220 // scroll distance the scene stays pinned while it turns from the landing into the showcase
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
// Scramble cycles through these and settles on the last
const showcaseWords = ['Brands', 'Interfaces', 'Worlds', 'Visions']
// Covers on the ring around the character, in the "All" order of the projects section
const ringCards: RingCard[] = projects.map((p) => ({
  cover: p.cover,
  title: p.title,
  href: p.behance ?? p.live ?? p.medium ?? p.instagram,
}))

function ShowcaseCopy({ revealed }: { revealed: boolean }) {
  return (
    <>
      <p className="text-xl font-medium tracking-[-0.03em] md:text-[34px]">Trusted to Bring</p>
      <h2 className="mt-1 text-[38px] leading-[1.05] font-semibold tracking-[-0.045em] md:text-[64px] xl:text-[76px]">
        Countless <ScrambleWords words={showcaseWords} start={revealed} /> to Life
      </h2>
      <div className="pointer-events-auto mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-8 md:mt-8">
        <Button
          href="#projects"
          icon={<ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />}
        >
          View selected work
        </Button>
        <Button href="#insights" variant="text" icon="arrow">
          Read my articles
        </Button>
      </div>
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
  const trackRef = useRef<HTMLDivElement>(null)
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

  // Scroll progress through the pinned track drives the scene; the landing copy fades out first, the showcase copy in
  // last. Styles are written straight to the DOM so scrolling doesn't re-render React.
  useEffect(() => {
    if (still) return
    let frame = 0
    const update = () => {
      frame = 0
      const track = trackRef.current
      if (!track) return
      const p = Math.min(
        1,
        Math.max(0, -track.getBoundingClientRect().top / ((TRANSITION_VH / 100) * innerHeight)),
      )
      sceneRef.current?.setProgress(p)
      const out = 1 - smooth(0.04, 0.22, p),
        inn = smooth(0.8, 0.96, p)
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
      if (p > 0.85) setRevealed(true)
    }
    const onScroll = () => (frame ||= requestAnimationFrame(update))
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
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
      className={`h-[100svh] min-h-[560px] overflow-hidden bg-paper bg-[radial-gradient(ellipse_60%_45%_at_50%_72%,#ffffff_0%,transparent_70%)] ${
        still ? 'relative' : 'sticky top-0'
      }`}
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
        className="relative z-10 flex flex-col items-center px-5 pt-[22svh] text-center md:pt-[24svh]"
      >
        <motion.p {...show(0)} className="text-base text-mute md:text-xl">
          Hi, I&apos;m <span className="font-semibold text-ink">{profile.name}!</span>
        </motion.p>
        <motion.h1
          {...show(0.1)}
          className="mt-3 text-[40px] leading-[1] font-semibold tracking-[-0.045em] md:text-[72px] xl:text-[88px]"
        >
          Crafting Digital Experience
        </motion.h1>
        <motion.p {...show(0.2)} className="mt-3 text-lg font-medium text-mute md:mt-4 md:text-3xl">
          across <span className="font-semibold">UI</span>,{' '}
          <span className="font-semibold">Graphic Design</span>, and{' '}
          <span className="font-semibold">3D</span>
        </motion.p>
        <motion.div
          {...show(0.3)}
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:mt-9"
        >
          <Button
            href="#services"
            icon={<ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />}
          >
            Explore My Work
          </Button>
          <Button href={profile.cv} target="_blank" rel="noreferrer" variant="outline" icon="arrow">
            Download CV
          </Button>
        </motion.div>
      </div>

      {!still && (
        <div
          ref={showcaseRef}
          className="pointer-events-none invisible absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5 pt-[13svh] text-center opacity-0"
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
          <div className="pointer-events-none relative z-10 flex flex-col items-center px-5 pt-[13svh] text-center">
            <ShowcaseCopy revealed />
          </div>
        </section>
      </>
    )

  // The spacer is the scroll distance of the transition; afterwards the showcase scrolls away with the page
  return (
    <div ref={trackRef} className="relative">
      {landing}
      <div aria-hidden style={{ height: `${TRANSITION_VH}svh` }} />
    </div>
  )
}
