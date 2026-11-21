import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { profile } from '../../data/content'
import { Button } from '../ui/Button'

const ease = [0.22, 1, 0.36, 1] as const

/** 3D landing: Arumbae Neira grass hill with the Chibi character, rendered with three.js behind the intro copy. */
export function Landing({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let scene:
      | Awaited<ReturnType<typeof import('../../three/landingScene').createLandingScene>>
      | undefined
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
        scene = s
        setSceneReady(true)
        // stop rendering while the section is off screen
        io = new IntersectionObserver(([e]) => s.setActive(e.isIntersecting))
        io.observe(sectionRef.current!)
      })
      .catch((err) => console.error('Landing scene failed to load', err)) // the sky gradient and copy still show
    return () => {
      disposed = true
      io?.disconnect()
      scene?.dispose()
    }
  }, [])

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, delay, ease },
  })

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-[linear-gradient(180deg,#1e9bf5_0%,#52b4fa_45%,#cfe9ff_100%)]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-1000 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative z-10 flex flex-col items-center px-5 pt-[22svh] text-center text-white [text-shadow:0_2px_24px_rgba(17,60,120,0.25)] md:pt-[24svh]">
        <motion.p {...show(0)} className="text-base md:text-xl">
          Hi, I&apos;m <span className="font-semibold">{profile.name}!</span>
        </motion.p>
        <motion.h1
          {...show(0.1)}
          className="mt-3 text-[40px] leading-[1] font-semibold tracking-[-0.045em] md:text-[72px] xl:text-[88px]"
        >
          Crafting Digital Experience
        </motion.h1>
        <motion.p {...show(0.2)} className="mt-3 text-lg font-medium md:mt-4 md:text-3xl">
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
            variant="light"
            icon={<ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />}
          >
            Explore My Work
          </Button>
          <Button href={profile.cv} target="_blank" rel="noreferrer" variant="glass" icon="arrow">
            Download CV
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
