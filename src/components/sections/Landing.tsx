import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, Leaf, Sun } from 'lucide-react'
import { profile } from '../../data/content'
import { Button } from '../ui/Button'
import type { LandingScene, Season } from '../../three/landingScene'

const ease = [0.22, 1, 0.36, 1] as const

/** 3D landing: Arumbae Neira grass hill with the Chibi character, rendered with three.js behind the intro copy. */
export function Landing({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [season, setSeason] = useState<Season>('summer')
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
          still: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        }),
      )
      .then((s) => {
        if (disposed) return s.dispose()
        sceneRef.current = s
        setSceneReady(true)
        // stop rendering while the section is off screen
        io = new IntersectionObserver(([e]) => s.setActive(e.isIntersecting))
        io.observe(sectionRef.current!)
      })
      .catch((err) => console.error('Landing scene failed to load', err)) // the sky gradient and copy still show
    return () => {
      disposed = true
      io?.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = undefined
    }
  }, [])

  const pickSeason = (next: Season) => {
    setSeason(next)
    sceneRef.current?.setSeason(next)
  }

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, delay, ease },
  })

  return (
    <section
      ref={sectionRef}
      id="top"
      // Same paper + soft glow as the scene background (three/post.ts), shown until the canvas fades in
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-paper bg-[radial-gradient(ellipse_60%_45%_at_50%_72%,#ffffff_0%,transparent_70%)]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-1000 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative z-10 flex flex-col items-center px-5 pt-[22svh] text-center md:pt-[24svh]">
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
}
