import { articles } from '../../data/content'
import { ArticleCard } from '../cards/ArticleCard'
import { Button } from '../ui/Button'
import { Container, Reveal, SectionHeader } from '../ui/Layout'

export function Insights() {
  return (
    <section id="insights" className="pb-24 md:pb-40">
      <Container>
        <SectionHeader
          index="03"
          label="Insights"
          title="Insights & Articles"
          subtitle="Thoughts on design, process, and learning, published on Medium."
        />

        {/* Carousel below desktop, 3-column grid on desktop */}
        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:-mx-10 md:mt-16 md:gap-6 md:px-10 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {articles.map((a, i) => (
            <Reveal
              key={a.id}
              delay={i * 0.08}
              className="w-[82%] shrink-0 snap-start md:w-[44%] lg:w-auto"
            >
              <ArticleCard {...a} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center md:mt-16">
          <Button href="https://medium.com/" target="_blank" rel="noreferrer" variant="outline" icon="arrow">
            View all on Medium
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}
