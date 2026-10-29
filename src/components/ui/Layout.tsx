import type { ReactNode } from 'react'
import { motion } from 'motion/react'

export function Container({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-10 xl:px-[120px] ${className}`}>
      {children}
    </div>
  )
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`text-[12px] font-medium tracking-[0.14em] text-mute uppercase ${className}`}>
      {children}
    </span>
  )
}

/** Editorial section header: "01 — Services" label on the left, display heading on the right. */
export function SectionHeader({
  index,
  label,
  title,
  subtitle,
  aside,
}: {
  index: string
  label: string
  title: string
  subtitle?: string
  aside?: ReactNode
}) {
  return (
    <div className="border-t border-line pt-6 md:pt-8">
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        <Reveal className="col-span-12 lg:col-span-3">
          <Label>
            <span className="text-ink">{index}</span> — {label}
          </Label>
        </Reveal>
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-9 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={0.05}>
            <h2 className="text-[44px] leading-[0.95] font-medium tracking-[-0.045em] md:text-[72px] xl:text-[88px]">
              {title}
            </h2>
            {subtitle && <p className="mt-5 max-w-md text-base text-mute md:text-lg">{subtitle}</p>}
          </Reveal>
          {aside && <Reveal delay={0.1}>{aside}</Reveal>}
        </div>
      </div>
    </div>
  )
}
