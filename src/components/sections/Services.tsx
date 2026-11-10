import { useRef, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { services } from '../../data/content'
import { ServiceCard } from '../cards/ServiceCard'
import { Container, Reveal, SectionHeader } from '../ui/Layout'

type ServiceItem = (typeof services)[number]

const PEEK = 30 // px each waiting card shows below the one in front of it
const SCALE_STEP = 0.05
const HOLD = 0.06 // part of each scroll segment where the deck rests between moves

// Exit in two phases: the front card first flips back on its bottom edge (top tipping away),
// then flies up out of the viewport. FLIP = share of the transition spent on the flip.
const FLIP = 0.45
const FLIP_TILT = 62 // deg reached at the end of the flip
const FLIP_LIFT = 18 // % the card rises during the flip
const EXIT_TILT = 80
const EXIT_LIFT = 160
const EXIT_SCALE = 0.92

/**
 * Scroll keyframes for an N-card deck. Stage k = card k is in front; each transition runs
 * between stages with a short hold at both ends and an extra point where the flip ends.
 * Returns the progress points and, per point, the (possibly fractional) stage.
 */
export function deckKeyframes(total: number) {
  const step = 1 / (total - 1)
  const points: number[] = []
  const stages: number[] = []
  for (let k = 0; k < total - 1; k++) {
    const a = k * step + HOLD * step
    const b = (k + 1) * step - HOLD * step
    points.push(a, a + FLIP * (b - a), b)
    stages.push(k, k + FLIP, k + 1)
  }
  return { points, stages }
}

/** Exit pose for a card at depth `d` (0 = in front, -1 = fully gone), linear within each phase. */
export function exitPose(d: number) {
  const t = Math.min(Math.max(-d, 0), 1)
  if (t <= FLIP) {
    const u = t / FLIP
    return { lift: FLIP_LIFT * u, tilt: FLIP_TILT * u, scale: 1 - (1 - EXIT_SCALE) * u }
  }
  const u = (t - FLIP) / (1 - FLIP)
  return {
    lift: FLIP_LIFT + (EXIT_LIFT - FLIP_LIFT) * u,
    tilt: FLIP_TILT + (EXIT_TILT - FLIP_TILT) * u,
    scale: EXIT_SCALE,
  }
}

function StackedServiceCard({
  service,
  index,
  total,
  progress,
  revealed,
}: {
  service: ServiceItem
  index: number
  total: number
  progress: MotionValue<number>
  revealed: boolean
}) {
  const { points, stages } = deckKeyframes(total)
  // Depth behind the front card; negative once this card has left
  const depth = stages.map((k) => index - k)

  // Outer layer: position in the stack (waiting cards sit lower and smaller)
  const stackY = useTransform(
    progress,
    points,
    depth.map((d) => Math.max(d, 0) * PEEK),
  )
  const stackScale = useTransform(
    progress,
    points,
    depth.map((d) => 1 - Math.max(d, 0) * SCALE_STEP),
  )
  // Inner layer: this card's own exit up and out of the viewport
  const poses = depth.map(exitPose)
  const exitY = useTransform(
    progress,
    points,
    poses.map((p) => `${-p.lift}%`),
  )
  const rotateX = useTransform(
    progress,
    points,
    poses.map((p) => p.tilt),
  )
  const exitScale = useTransform(
    progress,
    points,
    poses.map((p) => p.scale),
  )

  return (
    <motion.div
      style={{
        y: stackY,
        scale: stackScale,
        zIndex: total - index,
        transformOrigin: 'center bottom',
      }}
      className="col-start-1 row-start-1 w-full will-change-transform"
    >
      <motion.div
        style={{
          y: exitY,
          rotateX,
          scale: exitScale,
          // Perspective on the rotating element itself; an ancestor's `perspective` doesn't reach it
          transformPerspective: 1200,
          transformOrigin: 'center bottom',
        }}
        className="will-change-transform"
      >
        <ServiceCard {...service} revealed={revealed} />
      </motion.div>
    </motion.div>
  )
}

export function Services() {
  const trackRef = useRef<HTMLDivElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })
  // Front card index, flipping halfway through each transition; drives the per-card content reveal
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) =>
    setActive(Math.min(services.length - 1, Math.round(p * (services.length - 1)))),
  )
  // Wait until most of the deck itself is on screen, so the first card's entrance is actually seen
  const inView = useInView(deckRef, { once: true, amount: 0.6 })

  return (
    <section id="services" className="pb-24 md:pb-40">
      <Container>
        <SectionHeader
          index="01"
          label="Services"
          title="What I do"
          aside={
            <p className="max-w-[340px] text-base leading-relaxed text-mute lg:pb-3 lg:text-right">
              Three disciplines, one approach: start with people, then make it sharp.
            </p>
          }
        />

        {/* Scroll-driven stacked deck */}
        <div ref={trackRef} className="relative mt-10 h-[250vh] md:mt-14 md:h-[270vh]">
          <div className="sticky top-20 flex min-h-[calc(100vh-5rem)] items-center justify-center py-6">
            <Reveal className="w-full max-w-[980px]">
              <div ref={deckRef} className="grid grid-cols-1 items-center pb-16">
                {services.map((s, i) => (
                  <StackedServiceCard
                    key={s.number}
                    service={s}
                    index={i}
                    total={services.length}
                    progress={scrollYProgress}
                    revealed={inView && i <= active}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
