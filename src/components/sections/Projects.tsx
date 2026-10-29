import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { categories, projects, type Category } from '../../data/content'
import { ProjectCard } from '../cards/ProjectCard'
import { Chip } from '../ui/Chip'
import { Container, Reveal, SectionHeader } from '../ui/Layout'

type Filter = 'All' | Category

export function Projects() {
  const [filter, setFilter] = useState<Filter>('All')
  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter)
  const filters: Filter[] = ['All', ...categories]
  const countFor = (f: Filter) =>
    f === 'All' ? projects.length : projects.filter((p) => p.category === f).length

  return (
    <section id="projects" className="pb-24 md:pb-40">
      <Container>
        <SectionHeader index="02" label="Selected Projects" title="Selected work" />

        <Reveal delay={0.1} className="mt-10 md:mt-14">
          <div className="flex items-center justify-between gap-6">
            <div
              role="group"
              aria-label="Filter projects"
              className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0"
            >
              {filters.map((f) => (
                <Chip key={f} active={filter === f} count={countFor(f)} onClick={() => setFilter(f)}>
                  {f}
                </Chip>
              ))}
            </div>
            <p className="hidden shrink-0 font-mono text-[12px] text-mute xl:block">
              Showing {String(visible.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </p>
          </div>
        </Reveal>

        <motion.div
          layout
          className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 md:mt-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Reveal>
                  <ProjectCard project={p} />
                </Reveal>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  )
}
