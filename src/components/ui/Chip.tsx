type ChipProps = {
  active?: boolean
  count?: number
  onClick?: () => void
  children: string
}

export function Chip({ active, count, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out-soft active:scale-[0.97] md:h-11 md:px-5 ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line bg-transparent text-ink hover:border-accent hover:text-accent'
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`font-mono text-[11px] tabular-nums ${active ? 'text-accent' : 'text-mute'}`}
        >
          {String(count).padStart(2, '0')}
        </span>
      )}
    </button>
  )
}
