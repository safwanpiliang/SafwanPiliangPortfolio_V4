import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { services } from '../../data/content'
import { ServiceCard } from '../cards/ServiceCard'
import { Container, Reveal, SectionHeader } from '../ui/Layout'

type ServiceItem = (typeof services)[number]

function StackedServiceCard({
  service,
  index,
  total,
  progress,
}: {
  service: ServiceItem
  index: number
  total: number
  progress: MotionValue<number>
}) {
  // Two scroll transitions: [0.04 -> 0.46] peels card 0, [0.52 -> 0.94] peels card 1
  const seg1Start = 0.04
  const seg1End = 0.46
  const seg2Start = 0.52
  const seg2End = 0.94

  const y = useTransform(progress, (p) => {
    if (index === 0) {
      if (p <= seg1Start) return '0%'
      if (p >= seg1End) return '-125%'
      const t = (p - seg1Start) / (seg1End - seg1Start)
      return `${-t * 125}%`
    }
    if (index === 1) {
      if (p <= seg1Start) return '26px'
      if (p <= seg1End) {
        const t = (p - seg1Start) / (seg1End - seg1Start)
        return `${26 * (1 - t)}px`
      }
      if (p <= seg2Start) return '0%'
      if (p >= seg2End) return '-125%'
      const t = (p - seg2Start) / (seg2End - seg2Start)
      return `${-t * 125}%`
    }
    // index === 2
    if (p <= seg1Start) return '52px'
    if (p <= seg1End) {
      const t = (p - seg1Start) / (seg1End - seg1Start)
      return `${52 - 26 * t}px`
    }
    if (p <= seg2Start) return '26px'
    if (p <= seg2End) {
      const t = (p - seg2Start) / (seg2End - seg2Start)
      return `${26 * (1 - t)}px`
    }
    return '0px'
  })

  const scale = useTransform(progress, (p) => {
    if (index === 0) {
      if (p <= seg1Start) return 1
      if (p >= seg1End) return 0.9
      const t = (p - seg1Start) / (seg1End - seg1Start)
      return 1 - 0.1 * t
    }
    if (index === 1) {
      if (p <= seg1Start) return 0.94
      if (p <= seg1End) {
        const t = (p - seg1Start) / (seg1End - seg1Start)
        return 0.94 + 0.06 * t
      }
      if (p <= seg2Start) return 1
      if (p >= seg2End) return 0.9
      const t = (p - seg2Start) / (seg2End - seg2Start)
      return 1 - 0.1 * t
    }
    // index === 2
    if (p <= seg1Start) return 0.88
    if (p <= seg1End) {
      const t = (p - seg1Start) / (seg1End - seg1Start)
      return 0.88 + 0.06 * t
    }
    if (p <= seg2Start) return 0.94
    if (p <= seg2End) {
      const t = (p - seg2Start) / (seg2End - seg2Start)
      return 0.94 + 0.06 * t
    }
    return 1
  })

  // 3D perspective tilt as the active card slides up off the screen
  const rotateX = useTransform(progress, (p) => {
    if (index === 0) {
      if (p <= seg1Start) return 0
      if (p >= seg1End) return 24
      const t = (p - seg1Start) / (seg1End - seg1Start)
      return t * 24
    }
    if (index === 1) {
      if (p <= seg2Start) return 0
      if (p >= seg2End) return 24
      const t = (p - seg2Start) / (seg2End - seg2Start)
      return t * 24
    }
    return 0
  })

  return (
    <motion.div
      style={{
        y,
        scale,
        rotateX,
        zIndex: total - index,
        transformOrigin: 'center bottom',
      }}
      className="col-start-1 row-start-1 w-full will-change-transform"
    >
      <ServiceCard {...service} />
    </motion.div>
  )
}

export function Services() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

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
            <Reveal className="w-full max-w-[980px] [perspective:1200px]">
              <div className="grid grid-cols-1 items-center pb-14">
                {services.map((s, i) => (
                  <StackedServiceCard
                    key={s.number}
                    service={s}
                    index={i}
                    total={services.length}
                    progress={scrollYProgress}
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
