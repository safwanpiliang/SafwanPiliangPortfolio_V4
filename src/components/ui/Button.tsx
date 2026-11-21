import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Variant = 'primary' | 'outline' | 'light' | 'glass' | 'text'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: Variant
  size?: Size
  icon?: ReactNode | 'arrow' | false
  disabled?: boolean
  children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>

const base =
  'group/btn shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-out-soft select-none'

const variants: Record<Variant, string> = {
  primary: 'rounded-full bg-ink text-paper hover:bg-accent active:scale-[0.97]',
  outline:
    'rounded-full border border-line bg-transparent text-ink hover:border-ink hover:bg-ink/[0.03] active:scale-[0.97]',
  light: 'rounded-full bg-paper text-ink hover:bg-accent hover:text-white active:scale-[0.97]',
  glass:
    'rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-sm hover:bg-white hover:text-ink active:scale-[0.97]',
  text: 'text-ink hover:text-accent',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-16 px-8 text-lg md:h-20 md:px-10 md:text-2xl',
}

const disabledClass =
  'pointer-events-none cursor-not-allowed rounded-full border border-dashed border-line bg-transparent text-mute/60'

export function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const iconSize = size === 'lg' ? 'size-6 md:size-7' : size === 'sm' ? 'size-3.5' : 'size-4'
  const iconNode =
    icon === 'arrow' ? (
      <ArrowUpRight
        aria-hidden
        className={`${iconSize} transition-transform duration-300 ease-out-soft group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5`}
        strokeWidth={1.75}
      />
    ) : (
      icon || null
    )

  const padding = variant === 'text' ? '' : sizes[size]
  const textSize = variant === 'text' ? (size === 'sm' ? 'text-[13px]' : 'text-[15px]') : ''
  const display = className.includes('hidden') ? '' : 'inline-flex'

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title={rest.title}
        className={`${display} ${base} ${padding} ${textSize} ${disabledClass} ${className}`}
      >
        {children}
        {iconNode}
      </span>
    )
  }

  return (
    <a
      className={`${display} ${base} ${variants[variant]} ${padding} ${textSize} ${className}`}
      {...rest}
    >
      {variant === 'text' ? <span className="link-slide pb-0.5">{children}</span> : children}
      {iconNode}
    </a>
  )
}
