import { motion, type Variants } from 'motion/react'
import { ArrowRight, Box, LayoutTemplate, PenTool } from 'lucide-react'

const icons = { ui: LayoutTemplate, brand: PenTool, '3d': Box }

const ease = [0.22, 1, 0.36, 1] as const

// Same entrance for every card when it reaches the front: content builds top to bottom.
const stagger = (gap: number, delay = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap, delayChildren: delay } },
})
const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}
const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  shown: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
}
const lineIn: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 0.8, ease } },
}
const thumbIn: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.9, rotate: -4 },
  shown: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { duration: 0.7, ease } },
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
  /** True once this card has reached the front of the deck. */
  revealed: boolean
}

const toneStyles = {
  accent: {
    card: 'bg-accent text-paper border-accent shadow-[0_32px_80px_-28px_rgba(17,17,17,0.45)]',
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
  revealed,
}: Props) {
  const Icon = icons[icon]
  const styles = toneStyles[tone]

  return (
    <motion.article
      initial="hidden"
      animate={revealed ? 'shown' : 'hidden'}
      variants={stagger(0.12)}
      className={`relative flex w-full flex-col justify-between rounded-[24px] border p-6 md:min-h-[520px] md:rounded-[28px] md:p-10 lg:p-12 ${styles.card}`}
    >
      {/* Top Row: Large Title + Description & Number */}
      <motion.div variants={stagger(0.08)} className="flex items-start justify-between gap-6">
        <div className="max-w-[620px]">
          <motion.h3
            variants={rise}
            className="text-[32px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[44px] md:text-[54px]"
          >
            {title}
          </motion.h3>
          <motion.p
            variants={rise}
            className={`mt-4 max-w-[540px] text-[15px] leading-relaxed md:mt-5 md:text-[17px] ${styles.muted}`}
          >
            {description}
          </motion.p>
        </div>

        <motion.span
          variants={pop}
          className={`font-mono text-[20px] font-medium tracking-[-0.03em] md:text-[28px] ${styles.muted}`}
        >
          ({number})
        </motion.span>
      </motion.div>

      {/* Bottom Row: Left summary + tags, Right 3 preview thumbnails + CTA pill */}
      <motion.div
        variants={stagger(0.1)}
        className="relative mt-8 grid grid-cols-1 gap-6 pt-6 md:mt-12 md:grid-cols-12 md:items-end md:pt-8"
      >
        {/* Divider draws in from the left */}
        <motion.span
          variants={lineIn}
          aria-hidden
          className={`absolute inset-x-0 top-0 origin-left border-t ${styles.divider}`}
        />
        <motion.div
          variants={stagger(0.06)}
          className="flex flex-col justify-between gap-5 md:col-span-5"
        >
          <motion.div variants={rise} className="flex items-start gap-3.5">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full border ${styles.badge}`}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-[14px] leading-snug font-medium md:text-[15px]">{note}</p>
          </motion.div>

          <motion.ul variants={stagger(0.05)} className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <motion.li
                key={t}
                variants={pop}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.04em] uppercase ${styles.badge}`}
              >
                {t}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div variants={stagger(0.09)} className="relative md:col-span-7">
          <div className="grid grid-cols-3 gap-2.5 md:gap-3.5">
            {previews.map((src, idx) => (
              <motion.div
                key={src}
                variants={thumbIn}
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

          <motion.a
            variants={pop}
            href="#projects"
            className={`group/cta absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium tracking-[0.06em] uppercase shadow-lg transition-colors duration-300 ease-out-soft md:right-4 md:bottom-4 md:px-5 md:py-2.5 ${styles.cta}`}
          >
            <span>Selected work</span>
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5"
              strokeWidth={2}
            />
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.article>
  )
}
