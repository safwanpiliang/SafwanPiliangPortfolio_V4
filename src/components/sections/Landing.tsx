import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, Leaf, Sun } from 'lucide-react'
import { profile } from '../../data/content'
import { Button } from '../ui/Button'
import type { LandingScene, Season } from '../../three/landingScene'

const ease = [0.22, 1, 0.36, 1] as const
const TRANSITION_VH = 150 // scroll distance the landing stays pinned while it turns and burns away
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * 3D landing: Arumbae Neira grass hill with the Chibi character, rendered with three.js behind the intro copy.
 * It sits pinned on top of the next section (`children`, given `revealed` once the burn is halfway): while the user
 * scrolls, the camera circles the character and the frame burns away like paper to uncover that section.
 * Reduced motion: no pin, no transition; the two sections simply follow each other.
 */
export function Landing({
  ready,
  children,
}: {
  ready: boolean
  children: (revealed: boolean) => ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLDivElement>(null)
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [revealed, setRevealed] = useState(still)
  const [done, setDone] = useState(false)
  const [season, setSeason] = useState<Season>('summer')
  const sceneRef = useRef<LandingScene>(undefined)
  const visibleRef = useRef(true),
    doneRef = useRef(false) // render only while on screen and not yet burnt away

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
        }),
      )
      .then((s) => {
        if (disposed) return s.dispose()
        sceneRef.current = s
        setSceneReady(true)
        // stop rendering while the landing is off screen
        io = new IntersectionObserver(([e]) => {
          visibleRef.current = e.isIntersecting
          s.setActive(e.isIntersecting && !doneRef.current)
        })
        io.observe(sectionRef.current!)
      })
      .catch((err) => {
        console.error('Landing scene failed to load', err) // the paper background and copy still show
        setSceneFailed(true)
      })
    return () => {
      disposed = true
      io?.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = undefined
    }
  }, [still])

  // Scroll progress through the pinned track → camera turn + burn in the scene; copy and toggle fade out first.
  // Styles are written straight to the DOM so scrolling doesn't re-render React.
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
      const copy = 1 - smooth(0.05, 0.3, p)
      for (const el of [copyRef.current, toggleRef.current])
        if (el) {
          el.style.opacity = String(copy)
          el.style.pointerEvents = copy < 0.05 ? 'none' : ''
        }
      if (copyRef.current) copyRef.current.style.transform = `translateY(${(1 - copy) * -24}px)`
      // without the scene there is nothing to burn: fade the whole landing instead
      if (sceneFailed && sectionRef.current)
        sectionRef.current.style.opacity = String(1 - smooth(0.3, 0.9, p))
      if (p > 0.45) setRevealed(true)
      const isDone = p >= 0.999
      if (isDone !== doneRef.current) {
        doneRef.current = isDone
        sceneRef.current?.setActive(visibleRef.current && !isDone)
        setDone(isDone)
      }
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
  }, [still, sceneFailed, sceneReady])

  const pickSeason = (next: Season) => {
    setSeason(next)
    sceneRef.current?.setSeason(next)
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
      // Paper + soft glow until the canvas takes over (it draws the same background, three/post.ts); then transparent,
      // so burnt pixels uncover the section underneath
      className={`h-[100svh] min-h-[560px] overflow-hidden ${
        still ? 'relative' : 'absolute inset-x-0 top-0 z-20'
      } ${sceneReady ? '' : 'bg-paper bg-[radial-gradient(ellipse_60%_45%_at_50%_72%,#ffffff_0%,transparent_70%)]'}`}
      style={done ? { visibility: 'hidden' } : undefined}
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
        {children(true)}
      </>
    )

  // The next section sits pinned under the landing; the spacer is the scroll distance of the transition
  return (
    <div ref={trackRef} className="relative">
      <div className="sticky top-0">
        {children(revealed)}
        {landing}
      </div>
      <div aria-hidden style={{ height: `${TRANSITION_VH}svh` }} />
    </div>
  )
}
