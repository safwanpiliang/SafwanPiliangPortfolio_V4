import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { File } from 'lucide-react'

/** How long the intro stays up. It does not wait for images to load. */
const DISPLAY_MS = 2000
const SEEN_KEY = 'intro-seen'

/** First visit in this browser session, and the visitor hasn't asked for reduced motion. */
export function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) === null
  } catch {
    return true // storage blocked: show it, it just won't be remembered
  }
}

/** Intro styled as opening a design file; the bar fills in pure CSS (`animate-load-bar`). */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* storage blocked */
      }
      document.body.style.overflow = ''
      setVisible(false)
      onDone()
    }, DISPLAY_MS)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="canvas-grid fixed inset-0 z-[10000] flex items-center justify-center px-4"
        >
          <div
            role="status"
            className="w-full max-w-80 rounded-xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <File aria-hidden className="size-4 shrink-0 text-accent" strokeWidth={2} />
              <span className="truncate">Safwan-Portfolio.fig</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-soft">
              <div className="h-full w-full origin-left animate-load-bar rounded-full bg-accent" />
            </div>
            <p className="mt-2 text-xs text-mute">Opening file…</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
