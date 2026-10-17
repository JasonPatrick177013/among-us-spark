import { useEffect, useRef, type CSSProperties } from 'react'

type Tone = 'sus' | 'gold' | 'sky' | 'lime' | 'violet'

const tones: Record<Tone, string> = {
  sus: '#ff4f63',
  gold: '#ffcb3d',
  sky: '#3fd2ff',
  lime: '#6cf08a',
  violet: '#b690ff',
}

/** Confetti pieces: [x offset, y offset, spin in degrees, width, height]. Each flies out of the box as it opens. */
const confetti = [
  [-130, -78, 220, 9, 15],
  [-92, -118, -170, 8, 8],
  [-52, -96, 130, 7, 14],
  [-14, -128, -230, 9, 9],
  [30, -102, 190, 8, 15],
  [76, -124, -150, 7, 7],
  [118, -76, 250, 9, 14],
  [-160, -34, -110, 8, 8],
  [158, -40, 170, 7, 13],
  [-68, -62, 310, 6, 12],
  [64, -70, -270, 8, 8],
  [14, -54, 100, 6, 11],
]
const palette = ['#ff4f63', '#ffcb3d', '#3fd2ff', '#6cf08a', '#b690ff']

/* One shared scroll listener drives every box on the page. */
const subscribers = new Set<() => void>()
let frame = 0
function schedule() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    subscribers.forEach((update) => update())
  })
}
function subscribe(update: () => void) {
  if (subscribers.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  subscribers.add(update)
  return () => {
    subscribers.delete(update)
    if (subscribers.size === 0) {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }
}

type SectionTransitionProps = {
  /** Name of the area you are about to enter. Decorative, so it is hidden from screen readers. */
  label: string
  tone?: Tone
}

/**
 * A gift-style supply box that opens as you scroll: the lid pops off, light and confetti burst
 * out, and the next section's name rises from inside. It is tied to scroll position, so
 * scrolling back down closes it again. Reduced-motion users see it already open.
 */
export function SectionTransition({ label, tone = 'sky' }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--open', '1')
      return
    }
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const center = rect.top + rect.height / 2
      // Closed while the box is near the bottom of the screen, fully open once it reaches the middle.
      const t = Math.min(1, Math.max(0, (vh * 0.92 - center) / (vh * 0.42)))
      el.style.setProperty('--open', (1 - Math.pow(1 - t, 3)).toFixed(3))
    }
    update()
    return subscribe(update)
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="crate-scene" style={{ '--tone': tones[tone] } as CSSProperties}>
      <div className="crate-rays" />
      {confetti.map(([dx, dy, rot, w, h], i) => (
        <span
          key={i}
          className="crate-bit"
          style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, '--rot': `${rot}deg`, '--c': palette[i % palette.length], width: w, height: h } as CSSProperties}
        />
      ))}
      <span className="crate-label readout">{label}</span>
      <div className="crate">
        <div className="crate-body" />
        <div className="crate-lid">
          <span className="crate-bow" />
        </div>
      </div>
    </div>
  )
}
