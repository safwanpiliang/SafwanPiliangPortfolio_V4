import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { navLinks, profile, socials } from '../../data/content'
import { Button } from '../ui/Button'

const imgLogo = '/images/logo.svg'

export function Navbar({ ready }: { ready: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  // #top holds two views (landing, then the showcase after the transition); Landing reports which one is showing
  const [view, setView] = useState('landing')
  useEffect(() => {
    const onView = (e: Event) => setView((e as CustomEvent<string>).detail)
    addEventListener('landing-view', onView)
    return () => removeEventListener('landing-view', onView)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section currently in view
  useEffect(() => {
    const ids = [
      ...new Set(
        navLinks.map((l) => l.href.slice(1)).map((id) => (id === 'showcase' ? 'top' : id)),
      ),
    ]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-5 pt-4 md:px-10 md:pt-5 xl:px-[120px]"
    >
      <div
        className={`pointer-events-auto relative flex w-full items-center justify-between rounded-full transition-[max-width,background-color,border-color,box-shadow,padding,backdrop-filter] duration-500 ease-out-soft ${
          scrolled || open
            ? 'max-w-[820px] border border-line/80 bg-paper/90 py-2 pr-2 pl-5 shadow-[0_8px_24px_-8px_rgba(17,17,17,0.12)] backdrop-blur-xl md:pl-6'
            : 'max-w-[1200px] border border-transparent bg-transparent px-0 py-2'
        }`}
      >
        <a
          href="#top"
          onClick={() => setOpen(false)}
          aria-label={profile.name}
          className="group relative block h-[35px] w-[79px] shrink-0 transition-opacity duration-300 hover:opacity-75 md:h-[38px] md:w-[85.5px]"
        >
          <span className="absolute top-0 left-0 block h-[141.068px] w-[316.7px] origin-top-left scale-[0.25] md:scale-[0.27]">
            <img alt={profile.name} className="absolute inset-0 block max-w-none" src={imgLogo} />
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const id = link.href.slice(1)
            const isActive =
              id === 'top' || id === 'showcase'
                ? active === 'top' && (id === 'showcase') === (view === 'showcase')
                : active === id
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-ink' : 'text-mute hover:text-ink'
                }`}
              >
                <span className="link-slide pb-0.5">{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute top-1/2 left-1 size-1 -translate-y-1/2 rounded-full bg-accent"
                  />
                )}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href="#contact"
            size="sm"
            icon="arrow"
            className="hidden md:inline-flex md:h-10 md:px-4"
          >
            Let&apos;s talk
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex size-10 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-ink md:hidden"
          >
            {open ? (
              <X className="size-4" strokeWidth={1.75} />
            ) : (
              <Menu className="size-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto fixed inset-x-5 top-20 rounded-[24px] border border-line bg-paper p-6 shadow-[0_16px_40px_-16px_rgba(17,17,17,0.18)] md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-line py-4 text-[22px] font-medium tracking-[-0.03em] text-ink active:text-accent"
                >
                  {link.label}
                  <span className="font-mono text-xs text-mute">0{i + 1}</span>
                </a>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-5">
              <Button
                href="#contact"
                onClick={() => setOpen(false)}
                icon="arrow"
                className="w-full"
              >
                Let&apos;s talk
              </Button>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    {s.label} <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
