import { motion, type Variants } from 'motion/react'
import { ArrowRight, Box, LayoutTemplate, PenTool } from 'lucide-react'

const icons = { ui: LayoutTemplate, brand: PenTool, '3d': Box }

const ease = [0.22, 1, 0.36, 1] as const

// How each card's thumbnails arrive when it reaches the front: rise, slide in from the right, pop.
const previewEntrances = [
  { y: 48, rotate: 0, scale: 1, x: 0 },
  { x: 80, rotate: 6, scale: 1, y: 0 },
  { scale: 0.6, rotate: -10, x: 0, y: 0 },
]

const textVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

type Props = {
  number: string
  icon: keyof typeof icons
  title: string
  description: string
  tags: readonly string[]
  note: string
  tone: 'accent' | 'ink' | 'paper'
  previews: readonly string[]
  /** Position in the deck; picks the thumbnail entrance. */
  index: number
  /** True once this card has reached the front of the deck. */
  revealed: boolean
}

const toneStyles = {
  accent: {
    card: 'bg-accent text-paper border-accent shadow-[0_32px_80px_-28px_rgba(47,91,255,0.45)]',
    muted: 'text-paper/75',
    divider: 'border-paper/20',
    badge: 'border-paper/25 bg-paper/10 text-paper',
    cta: 'bg-ink text-paper hover:bg-paper hover:text-ink',
  },
  ink: {
    card: 'bg-ink text-paper border-ink shadow-[0_32px_80px_-28px_rgba(17,17,17,0.45)]',
    muted: 'text-paper/70',
    divider: 'border-paper/15',
    badge: 'border-paper/20 bg-paper/10 text-paper',
    cta: 'bg-paper text-ink hover:bg-accent hover:text-paper',
  },
  paper: {
    card: 'bg-soft text-ink border-line shadow-[0_32px_80px_-28px_rgba(17,17,17,0.16)]',
    muted: 'text-mute',
    divider: 'border-line',
    badge: 'border-line bg-paper text-ink',
    cta: 'bg-ink text-paper hover:bg-accent hover:text-paper',
  },
} as const

export function ServiceCard({
  number,
  icon,
  title,
  description,
  tags,
  note,
  tone,
  previews,
  index,
  revealed,
}: Props) {
  const Icon = icons[icon]
  const styles = toneStyles[tone]
  const from = previewEntrances[index % previewEntrances.length]
  const previewVariants: Variants = {
    hidden: { opacity: 0, ...from },
    shown: (i: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.7, delay: 0.15 + i * 0.08, ease },
    }),
  }

  return (
    <motion.article
      initial="hidden"
      animate={revealed ? 'shown' : 'hidden'}
      className={`relative flex w-full flex-col justify-between rounded-[24px] border p-6 md:min-h-[520px] md:rounded-[28px] md:p-10 lg:p-12 ${styles.card}`}
    >
      {/* Top Row: Large Title + Description & Number */}
      <motion.div variants={textVariants} className="flex items-start justify-between gap-6">
        <div className="max-w-[620px]">
          <h3 className="text-[32px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[44px] md:text-[54px]">
            {title}
          </h3>
          <p
            className={`mt-4 max-w-[540px] text-[15px] leading-relaxed md:mt-5 md:text-[17px] ${styles.muted}`}
          >
            {description}
          </p>
        </div>

        <span
          className={`font-mono text-[20px] font-medium tracking-[-0.03em] md:text-[28px] ${styles.muted}`}
        >
          ({number})
        </span>
      </motion.div>

      {/* Bottom Row: Left summary + tags, Right 3 preview thumbnails + CTA pill */}
      <div
        className={`mt-8 grid grid-cols-1 gap-6 border-t pt-6 md:mt-12 md:grid-cols-12 md:items-end md:pt-8 ${styles.divider}`}
      >
        <div className="flex flex-col justify-between gap-5 md:col-span-5">
          <div className="flex items-start gap-3.5">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full border ${styles.badge}`}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-[14px] leading-snug font-medium md:text-[15px]">{note}</p>
          </div>

          <ul className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.04em] uppercase ${styles.badge}`}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative md:col-span-7">
          <div className="grid grid-cols-3 gap-2.5 md:gap-3.5">
            {previews.map((src, idx) => (
              <motion.div
                key={src}
                custom={idx}
                variants={previewVariants}
                className="aspect-[4/3] overflow-hidden rounded-[12px] bg-black/15 md:rounded-[14px]"
              >
                <img
                  src={src}
                  alt={`${title} preview ${idx + 1}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 ease-out-soft hover:scale-105"
                />
              </motion.div>
            ))}
          </div>

          <a
            href="#projects"
            className={`group/cta absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium tracking-[0.06em] uppercase shadow-lg transition-all duration-300 ease-out-soft md:right-4 md:bottom-4 md:px-5 md:py-2.5 ${styles.cta}`}
          >
            <span>Selected work</span>
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5"
              strokeWidth={2}
            />
          </a>
        </div>
      </div>
    </motion.article>
  )
}
