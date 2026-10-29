import { ArrowUpRight } from 'lucide-react'

type Props = {
  title: string
  date: string
  readTime: string
  thumbnail: string
  href: string
}

export function ArticleCard({ title, date, readTime, thumbnail, href }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col rounded-[20px] border border-line bg-white/60 p-3 transition-all duration-500 ease-out-soft hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgba(17,17,17,0.3)]"
    >
      <div className="aspect-video overflow-hidden rounded-[14px] bg-soft">
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col px-2 pt-5 pb-3">
        <p className="font-mono text-[12px] text-mute">
          {date} <span className="px-1">·</span> {readTime}
        </p>
        <h3 className="mt-3 line-clamp-2 text-[20px] leading-[1.25] font-medium tracking-[-0.02em] md:text-[22px]">
          {title}
        </h3>
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-[14px] font-medium text-ink transition-colors group-hover:text-accent">
          <span className="link-slide pb-0.5">Read on Medium</span>
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.75}
            className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </a>
  )
}
