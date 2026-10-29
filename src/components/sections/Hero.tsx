import { motion, type Variants } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { heroCards, profile } from '../../data/content'
import { Button } from '../ui/Button'
import { Container } from '../ui/Layout'

const imgSkybaseCat = '/images/hero/skybase-cat.svg'
const imgHeroCharacterLeft = '/images/hero/character-left.png'

const ease = [0.22, 1, 0.36, 1] as const

// Fan layout for the stack of work cards; index 3 is the centre card.
const fan = [
  { x: -390, y: 46, r: -14 },
  { x: -260, y: 18, r: -9 },
  { x: -130, y: 4, r: -4 },
  { x: 0, y: 0, r: 0 },
  { x: 130, y: 4, r: 4 },
  { x: 260, y: 18, r: 9 },
  { x: 390, y: 46, r: 14 },
]

const cardVariants: Variants = {
  hidden: { x: 0, y: 80, rotate: 0, opacity: 0 },
  show: (i: number) => ({
    x: fan[i].x,
    y: fan[i].y,
    rotate: fan[i].r,
    opacity: 1,
    transition: { duration: 1.1, delay: 0.35 + Math.abs(i - 3) * 0.06, ease },
  }),
  spread: (i: number) => ({
    x: fan[i].x * 1.14,
    y: fan[i].y * 1.3,
    rotate: fan[i].r * 1.25,
    opacity: 1,
    transition: { duration: 0.7, ease },
  }),
}

function Bubble({
  children,
  className,
  ready,
}: {
  children: string
  className: string
  ready: boolean
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={ready ? { opacity: 1, scale: 1 } : undefined}
      transition={{ delay: 1.25, duration: 0.6, ease }}
      className={`absolute z-30 rounded-full px-4 py-2 text-[15px] font-medium whitespace-nowrap shadow-[0_8px_24px_-8px_rgba(17,17,17,0.3)] ${className}`}
    >
      {children}
    </motion.span>
  )
}

function CardFan({ ready }: { ready: boolean }) {
  return (
    <div className="relative mx-auto h-[190px] w-full md:h-[290px] xl:h-[360px]" aria-hidden>
      <div className="absolute top-0 left-1/2 h-[360px] w-0 origin-top scale-[0.46] md:scale-[0.78] xl:scale-100">
        <motion.div
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          whileHover={ready ? 'spread' : undefined}
          className="relative"
        >
          {/* Enlarged hover target so the fan spreads when the pointer is anywhere over it */}
          <div className="absolute -top-6 -left-[520px] h-[380px] w-[1040px]" />
          {heroCards.map((src, i) => (
            <motion.div
              key={src}
              custom={i}
              variants={cardVariants}
              whileHover={{
                y: fan[i].y - 28,
                scale: 1.04,
                transition: { duration: 0.4, ease },
              }}
              style={{ zIndex: 10 - Math.abs(i - 3) }}
              className={`absolute top-6 -left-[105px] h-[270px] w-[210px] overflow-hidden rounded-[22px] bg-soft shadow-[0_30px_60px_-28px_rgba(17,17,17,0.45)] ring-1 ring-black/5 ${
                i === 0 || i === 6 ? 'hidden md:block' : ''
              }`}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </motion.div>
          ))}
          <Bubble ready={ready} className="-top-2 -left-[300px] bg-accent text-white">
            @ui-ux
          </Bubble>
          <Bubble ready={ready} className="top-0 left-[200px] bg-ink text-paper">
            @brand
          </Bubble>
          <Bubble
            ready={ready}
            className="top-[270px] left-[300px] border border-line bg-white text-ink"
          >
            @3d
          </Bubble>
        </motion.div>
      </div>
    </div>
  )
}

/** `ready` flips once the intro loader is gone; every entrance animation waits for it. */
export function Hero({ ready }: { ready: boolean }) {
  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      {/* Left 3D Character peeking half-body from the left edge */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: -70, rotate: 12 }}
        animate={ready ? { opacity: 1, x: 0, rotate: 21 } : undefined}
        transition={{ duration: 1, delay: 0.85, ease }}
        className="pointer-events-none absolute top-[150px] -left-[138px] z-20 hidden w-[260px] origin-center select-none sm:block md:top-[155px] md:-left-[178px] md:w-[340px] xl:top-[160px] xl:-left-[210px] xl:w-[400px]"
      >
        <img
          src={imgHeroCharacterLeft}
          alt=""
          className="block h-auto w-full drop-shadow-[0_24px_36px_rgba(17,17,17,0.18)]"
        />
      </motion.div>

      {/* Right SkyBase Cat Illustration peeking from the right edge */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 60, y: 12, rotate: 4 }}
        animate={ready ? { opacity: 1, x: 0, y: 0, rotate: 11 } : undefined}
        transition={{ duration: 1, delay: 0.95, ease }}
        className="pointer-events-none absolute top-[210px] -right-[16px] z-20 hidden h-[244px] w-[295.621px] origin-center scale-[0.65] select-none sm:block md:top-[235px] md:-right-[14px] md:scale-[0.84] xl:top-[260px] xl:-right-[10px] xl:scale-100"
      >
        <img alt="" className="absolute inset-0 block max-w-none" src={imgSkybaseCat} />
      </motion.div>

      <Container className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease }}
          className="flex max-w-full items-center"
        >
          <span className="rounded-full bg-soft px-3 py-1 text-[9.5px] font-medium tracking-[0.08em] whitespace-nowrap text-mute uppercase sm:px-4 sm:py-1.5 sm:text-[12px] sm:tracking-[0.14em]">
            {profile.role} — {profile.location}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="mt-8 text-[52px] leading-[0.92] font-medium tracking-[-0.055em] md:mt-10 md:text-[96px] xl:text-[120px]"
        >
          Crafting Digital
          <br />
          Experiences
        </motion.h1>
      </Container>

      <div className="mt-10 md:mt-14">
        <CardFan ready={ready} />
      </div>

      <Container className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 1.35, ease }}
          className="flex flex-col items-center"
        >
          <p className="text-[18px] font-medium tracking-[-0.02em] md:text-[20px]">
            {profile.name}
          </p>
          <p className="mt-2 max-w-[440px] text-base leading-relaxed text-mute md:text-lg">
            I design interfaces, brands, and visuals that feel simple, sharp, and human.
          </p>
          <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
            <Button
              href="#projects"
              icon={
                <ArrowDown
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-4 transition-transform duration-300 group-hover/btn:translate-y-0.5"
                />
              }
            >
              View selected work
            </Button>
            <Button href="#insights" variant="text" icon="arrow">
              Read my articles
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
