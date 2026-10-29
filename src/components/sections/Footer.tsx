import { useState } from 'react'
import { ArrowUp, Check, Copy } from 'lucide-react'
import { profile, socials } from '../../data/content'
import { Button } from '../ui/Button'
import { Container, Reveal } from '../ui/Layout'
import { TextLink } from '../ui/TextLink'

export function Footer() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable: mailto button still works */
    }
  }

  return (
    <footer id="contact" className="pt-4 pb-8 md:pt-6">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] bg-ink px-6 pt-8 pb-7 text-paper sm:px-8 md:rounded-[28px] md:px-10 md:pt-11 md:pb-9 lg:px-14 lg:pt-14 lg:pb-10 xl:rounded-[32px] xl:px-16 xl:pt-16 xl:pb-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full bg-accent/30 blur-[120px]"
            />
            <div className="relative">
              <span className="text-[12px] font-medium tracking-[0.14em] text-paper/50 uppercase">
                <span className="text-paper">05</span> — Contact
              </span>
              <h2 className="mt-5 max-w-[920px] text-[clamp(2.25rem,5.2vw,5.5rem)] leading-[0.98] font-medium tracking-[-0.05em] md:mt-7">
                Have a project in mind?{' '}
                <span className="text-paper/40">Let&apos;s build something great.</span>
              </h2>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center md:mt-10 lg:mt-12">
                <Button
                  href={`mailto:${profile.email}`}
                  variant="light"
                  size="lg"
                  icon="arrow"
                  className="h-13 px-6 text-base sm:h-14 sm:px-7 sm:text-lg lg:h-16 lg:px-8 lg:text-xl"
                >
                  {profile.email}
                </Button>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-paper/20 px-5 text-[14px] font-medium text-paper/80 transition-colors hover:border-paper hover:text-paper sm:self-center"
                >
                  {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" strokeWidth={1.75} />}
                  {copied ? 'Copied' : 'Copy email'}
                </button>
              </div>

              <div className="mt-10 flex flex-col gap-2 border-t border-paper/15 pt-5 text-[13px] text-paper/50 sm:flex-row sm:justify-between md:mt-12 lg:mt-16">
                <span>Usually replies within 24 hours</span>
                <span>Open to freelance, internships &amp; collaborations</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col gap-6 text-[14px] md:flex-row md:items-center md:justify-between">
          <span className="text-mute">© 2026 {profile.name}</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <TextLink key={s.label} href={s.href} target="_blank" rel="noreferrer" muted>
                {s.label}
              </TextLink>
            ))}
          </div>
          <a href="#top" className="group inline-flex items-center gap-1.5 font-medium transition-colors hover:text-accent">
            <span className="link-slide pb-0.5">Back to top</span>
            <ArrowUp className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.75} />
          </a>
        </div>
      </Container>
    </footer>
  )
}
