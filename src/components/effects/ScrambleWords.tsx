import { useEffect, useRef } from 'react'

const CHARS = 'abcdefghijklmnopqrstuvwxyz'
const FRAME_MS = 40

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** One frame of scrambling `from` into `to`: letters lock in left to right as `progress` goes 0 → 1. */
export function scrambleFrame(to: string, progress: number, random = Math.random) {
  let out = ''
  for (let i = 0; i < to.length; i++) {
    out += progress >= (i + 1) / to.length ? to[i] : CHARS[Math.floor(random() * CHARS.length)]
  }
  return out
}

/**
 * Shows each word in turn, scrambling into the next, and stops on the last one (no loop).
 * Frames are written straight to the DOM, so it never re-renders React. Screen readers only
 * get the final word, and the box is sized to the widest word so the heading doesn't shift.
 */
export function ScrambleWords({
  words,
  start,
  delay = 0,
  hold = 1300,
  duration = 600,
  reserve = true,
}: {
  words: string[]
  /** Begins the sequence (e.g. once the hero entrance has played). */
  start: boolean
  /** Wait after `start` before the first change. */
  delay?: number
  /** How long each word stays readable. */
  hold?: number
  /** Length of one scramble. */
  duration?: number
  /** Hold the widest word's width so nothing after it moves; off for a word mid-line, where it leaves gaps. */
  reserve?: boolean
}) {
  const textRef = useRef<HTMLSpanElement>(null)
  const wordsKey = words.join('\n')
  const final = words[words.length - 1]
  const widest = words.reduce((a, b) => (b.length > a.length ? b : a))

  useEffect(() => {
    const node = textRef.current?.firstChild
    if (!node || !start) return
    const list = wordsKey.split('\n')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.nodeValue = list[list.length - 1]
      return
    }

    let cancelled = false
    const run = async () => {
      await wait(delay)
      for (let w = 1; w < list.length && !cancelled; w++) {
        if (w > 1) await wait(hold)
        const begin = performance.now()
        let progress = 0
        while (progress < 1 && !cancelled) {
          progress = Math.min((performance.now() - begin) / duration, 1)
          node.nodeValue = scrambleFrame(list[w], progress)
          await wait(FRAME_MS)
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [start, wordsKey, delay, hold, duration])

  return (
    <span className="inline-grid">
      <span className="sr-only">{final}</span>
      {/* Invisible copy of the widest word reserves the width */}
      {reserve && (
        <span aria-hidden className="invisible col-start-1 row-start-1">
          {widest}
        </span>
      )}
      <span aria-hidden ref={textRef} className="col-start-1 row-start-1">
        {words[0]}
      </span>
    </span>
  )
}
