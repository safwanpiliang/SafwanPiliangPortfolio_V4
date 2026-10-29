import type { Project } from '../../data/content'
import { Button } from '../ui/Button'

const assetPathPrefix = '/assets'
const imgRiMediumFill = `${assetPathPrefix}/9ce36.svg`
const imgDeviconBehance = `${assetPathPrefix}/dc5a2.svg`

export function ProjectCard({ project }: { project: Project }) {
  const { title, description, category, year, cover, behance, medium, live } = project
  return (
    <article className="group flex flex-col">
      <a
        href={live ?? behance ?? '#'}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${title}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-[14px] bg-soft transition-[transform,box-shadow] duration-500 ease-out-soft group-hover:-translate-y-1.5 group-hover:shadow-[0_32px_64px_-32px_rgba(17,17,17,0.35)] sm:rounded-[18px] md:rounded-[20px]"
      >
        <img
          src={cover}
          alt={`${title} cover`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4">
          <span className="inline-flex h-5 items-center rounded-full bg-white/80 px-2 text-[9.5px] font-medium text-ink backdrop-blur-md sm:h-6 sm:px-2.5 sm:text-[11px] md:h-7 md:px-3 md:text-[12px]">
            {category}
          </span>
        </div>
      </a>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4 md:pt-5">
        <div className="flex items-baseline justify-between gap-2 sm:gap-4">
          <h3 className="text-[14px] leading-[1.2] font-medium tracking-[-0.03em] sm:text-[18px] md:text-[22px]">
            {title}
          </h3>
          <span className="shrink-0 font-mono text-[10px] text-mute sm:text-[11px] md:text-[12px]">
            {year}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-3 text-[11.5px] leading-relaxed text-mute sm:mt-2 sm:line-clamp-none sm:text-[13.5px] md:mt-2.5 md:text-[15px]">
          {description}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 sm:gap-2 sm:pt-4 md:pt-5">
          <a
            href={behance}
            target="_blank"
            rel="noreferrer"
            aria-label={`${title} on Behance`}
            title="Behance"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-transparent transition-all duration-300 ease-out-soft hover:border-ink hover:bg-ink/[0.04] active:scale-[0.97] sm:size-8 md:size-9"
          >
            <span
              data-node-id="12:191"
              data-name="devicon:behance"
              className="relative size-[20px] shrink-0 scale-[0.7] grayscale contrast-125 sm:scale-[0.8] md:scale-[0.9]"
            >
              <img alt="" className="absolute inset-0 block max-w-none" src={imgDeviconBehance} />
            </span>
          </a>

          <a
            href={medium}
            target="_blank"
            rel="noreferrer"
            aria-label={`${title} case study on Medium`}
            title="Medium"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-transparent transition-all duration-300 ease-out-soft hover:border-ink hover:bg-ink/[0.04] active:scale-[0.97] sm:size-8 md:size-9"
          >
            <span
              data-node-id="12:190"
              data-name="ri:medium-fill"
              className="relative size-[20px] shrink-0 scale-[0.7] grayscale contrast-125 sm:scale-[0.8] md:scale-[0.9]"
            >
              <img alt="" className="absolute inset-0 block max-w-none" src={imgRiMediumFill} />
            </span>
          </a>

          {live ? (
            <Button
              variant="primary"
              size="sm"
              icon="arrow"
              href={live}
              target="_blank"
              rel="noreferrer"
              className="h-7 gap-1 px-2.5 text-[10.5px] [&_svg]:size-2.5 sm:h-8 sm:px-3 sm:text-[12px] sm:[&_svg]:size-3 md:h-9 md:gap-2 md:px-4 md:text-[13px] md:[&_svg]:size-3.5"
            >
              Live Project
            </Button>
          ) : (
            <Button
              size="sm"
              disabled
              title="No live version for this project"
              className="h-7 px-2.5 text-[10.5px] sm:h-8 sm:px-3 sm:text-[12px] md:h-9 md:px-4 md:text-[13px]"
            >
              Live soon
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
