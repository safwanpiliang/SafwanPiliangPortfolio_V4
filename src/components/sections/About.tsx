import { profile, socials, tools } from '../../data/content'
import { Container, Label, Reveal, SectionHeader } from '../ui/Layout'
import { TextLink } from '../ui/TextLink'

export function About() {
  return (
    <section id="about" className="pb-24 md:pb-40">
      <Container>
        <SectionHeader index="04" label="About" title="About me" />

        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-12 md:mt-16">
          <Reveal className="col-span-12 md:col-span-6 lg:col-span-5">
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-[20px] bg-soft">
              <img
                src={profile.portrait}
                alt={`Portrait of ${profile.name}`}
                loading="lazy"
                className="size-full object-cover object-[50%_60%] grayscale transition-[filter,transform] duration-700 ease-out-soft group-hover:scale-[1.03] group-hover:grayscale-0"
              />
              <figcaption className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-full bg-white/80 px-4 py-2.5 text-[13px] font-medium backdrop-blur-md">
                <span>{profile.name}</span>
                <span className="text-mute">{profile.location}</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="col-span-12 flex flex-col md:col-span-6 lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="text-[24px] leading-[1.3] font-medium tracking-[-0.025em] md:text-[28px] xl:text-[32px]">
                I&apos;m Safwan, a D-IV Software Engineering Technology student at Universitas
                Gadjah Mada who designs across <span className="text-accent">UI/UX</span>, brand,
                and 3D.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-6 text-base leading-relaxed text-mute md:text-lg">
                Studying how software is built keeps my design grounded in what can actually ship. I
                like to start with research and structure, then push the visuals until they feel
                simple, sharp, and human. Outside of client work, I write about process and learning
                on Medium.
              </p>
            </Reveal>

            <Reveal
              delay={0.1}
              className="mt-10 grid border-t border-line pt-8 gap-6 sm:grid-cols-[120px_1fr] sm:items-center"
            >
              <Label>Tools</Label>
              <ul className="flex flex-wrap gap-2">
                {tools.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-line px-4 py-1.5 text-[14px] transition-colors hover:border-accent hover:text-accent"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <Label>Elsewhere</Label>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-medium">
                {socials.map((s) => (
                  <TextLink key={s.label} href={s.href} target="_blank" rel="noreferrer" arrow>
                    {s.label}
                  </TextLink>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
