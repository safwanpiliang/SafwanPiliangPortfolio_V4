import type { AnchorHTMLAttributes } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  arrow?: boolean
  muted?: boolean
}

/** Inline link with a sliding underline. */
export function TextLink({ arrow, muted, className = '', children, ...rest }: Props) {
  return (
    <a
      className={`group inline-flex items-center gap-1 transition-colors duration-200 hover:text-accent ${
        muted ? 'text-mute' : 'text-ink'
      } ${className}`}
      {...rest}
    >
      <span className="link-slide pb-0.5">{children}</span>
      {arrow && (
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.75}
          className="size-[1em] transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </a>
  )
}
