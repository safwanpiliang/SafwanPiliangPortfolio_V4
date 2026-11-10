const project = (id: string) => `/images/projects/${id}.webp`

const ROW_1 = [
  { word: 'UI Design', src: project('porsenigama') },
  { word: 'Branding', src: project('bem-sv') },
  { word: '3D Mascots', src: project('gadani') },
]
const ROW_2 = [
  { word: 'Illustration', src: project('nobo') },
  { word: 'Social Media', src: project('tges') },
  { word: 'Systems', src: project('skybase') },
]

function Row({ items, reverse }: { items: typeof ROW_1; reverse?: boolean }) {
  return (
    <p
      className={`${reverse ? 'slide-band-reverse' : 'slide-band'} text-[48px] leading-[1.1] font-medium tracking-[-0.045em] whitespace-nowrap md:text-[112px]`}
    >
      {Array.from({ length: 3 }, (_, copy) =>
        items.map(({ word, src }) => (
          <span key={`${copy}-${word}`}>
            {word}
            <span className="relative mx-[0.25em] inline-block h-[0.7em] w-[1.05em] rotate-[-4deg] overflow-hidden rounded-[0.18em] bg-soft align-[-0.04em] shadow-[0_8px_24px_rgba(17,17,17,0.18)]">
              {/* eager: copies start off-screen horizontally and would pop in late if lazy-loaded */}
              <img src={src} alt="" className="size-full object-cover" />
            </span>
          </span>
        )),
      )}
    </p>
  )
}

/** Two oversized rows of disciplines with project thumbnails inline, sliding in opposite directions with the scroll. */
export function EditorialBand() {
  return (
    <div aria-hidden className="band-track w-full overflow-clip pb-24 md:pb-40">
      <Row items={ROW_1} />
      <Row items={ROW_2} reverse />
    </div>
  )
}
