import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useAnimation } from 'motion/react'
import { fakeCursors, type FakeCursorConfig } from '../../data/content'

// Desktop with a real pointer only, and never for reduced motion (the cursors would just jump).
const QUERY = '(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const useEnabled = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// A full transform string (not x/y) lets Motion hand the move to the compositor, so the
// endlessly wandering cursors stay smooth while the page is busy.
const at = (x: number, y: number) => `translate3d(${x}px, ${y}px, 0)`

/** Resolves immediately if the tab is visible, otherwise once it becomes visible again. */
const whenVisible = () =>
  new Promise<void>((resolve) => {
    if (!document.hidden) return resolve()
    const onChange = () => {
      if (document.hidden) return
      document.removeEventListener('visibilitychange', onChange)
      resolve()
    }
    document.addEventListener('visibilitychange', onChange)
  })

/** A fake Figma cursor that wanders around the page and occasionally types a chat bubble. */
function FakeCursor({
  cursorImage,
  cursorArrowImage,
  messages,
  themeColor,
  initialDelay,
}: Omit<FakeCursorConfig, 'id'>) {
  const controls = useAnimation()
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let active = true

    // Random start so the cursors don't overlap
    let currentX = Math.random() * window.innerWidth
    let currentY = window.scrollY + window.innerHeight / 2 + (Math.random() - 0.5) * 400

    const run = async () => {
      controls.set({ transform: at(currentX, currentY), opacity: 0 })
      if (initialDelay > 0) await sleep(initialDelay)
      if (!active) return

      await controls.start({ opacity: 1, transition: { duration: 1 } })

      while (active) {
        // Don't burn CPU animating while the tab is in the background
        await whenVisible()
        if (!active) return

        // Next target inside the current viewport (page coordinates, so it scrolls with the page)
        const nextX = Math.random() * (window.innerWidth - 100)
        const nextY = window.scrollY + Math.random() * (window.innerHeight - 100)
        // Offset midpoint for a curved, human-like path
        const midX = (currentX + nextX) / 2 + (Math.random() - 0.5) * 400
        const midY = (currentY + nextY) / 2 + (Math.random() - 0.5) * 400

        await controls.start({
          transform: [at(currentX, currentY), at(midX, midY), at(nextX, nextY)],
          transition: {
            duration: 0.8 + Math.random() * 1.2,
            ease: 'easeInOut',
            times: [0, 0.5, 1],
          },
        })
        currentX = nextX
        currentY = nextY

        if (Math.random() > 0.6) {
          setIsTyping(true)
          setDisplayedText('')
          await sleep(500 + Math.random() * 1000)
          if (!active) return

          const message = messages[Math.floor(Math.random() * messages.length)]
          for (let i = 0; i <= message.length; i++) {
            setDisplayedText(message.substring(0, i))
            await sleep(30 + Math.random() * 90)
            if (!active) return
          }

          await sleep(2500 + Math.random() * 1500) // time to "read" the message
          if (!active) return
          setIsTyping(false)
          setDisplayedText('')
        } else {
          await sleep(200 + Math.random() * 1300)
        }
      }
    }

    run()
    return () => {
      active = false
      controls.stop()
    }
  }, [controls, messages, initialDelay])

  return (
    <motion.div
      animate={controls}
      // Below the navbar (z-50) so it never covers navigation
      className="pointer-events-none absolute top-0 left-0 z-40 flex flex-col items-start drop-shadow-[1px_2px_2px_rgba(0,0,0,0.3)] will-change-transform"
    >
      <img
        src={isTyping ? cursorArrowImage : cursorImage}
        alt=""
        width={82}
        height={42}
        className="relative z-10 h-auto w-[90px]"
      />

      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            style={{ backgroundColor: themeColor, transformOrigin: 'top left' }}
            className="absolute top-5 left-[19px] z-20 flex min-h-9 items-center rounded-r-2xl rounded-bl-2xl px-3.5 py-2 text-[14px] font-medium whitespace-nowrap text-white shadow-md"
          >
            <span>{displayedText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="ml-[3px] h-3.5 w-0.5 rounded-full bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FakeCursors() {
  const enabled = useEnabled()
  if (!enabled) return null
  return (
    <div aria-hidden>
      {fakeCursors.map(({ id, ...config }) => (
        <FakeCursor key={id} {...config} />
      ))}
    </div>
  )
}
