import type { CSSProperties } from 'react'
import { useInView } from '../../hooks/useInView'

type Tone = 'sus' | 'gold' | 'sky' | 'lime' | 'violet'

const tones: Record<Tone, string> = {
  sus: '#ff4f63',
  gold: '#ffcb3d',
  sky: '#3fd2ff',
  lime: '#6cf08a',
  violet: '#b690ff',
}

type SectionTransitionProps = {
  /** Name of the area you are about to enter. Purely decorative, so it is hidden from screen readers. */
  label: string
  tone?: Tone
}

/**
 * Bulkhead doors that slide apart the first time they scroll into view, like moving
 * between ship decks. Decorative only. Reduced-motion users see the open state instantly.
 */
export function SectionTransition({ label, tone = 'sky' }: SectionTransitionProps) {
  const [ref, open] = useInView<HTMLDivElement>(0.7)
  return (
    <div ref={ref} aria-hidden="true" className={`bulkhead ${open ? 'is-open' : ''}`} style={{ '--tone': tones[tone] } as CSSProperties}>
      <div className="bulkhead-glow" />
      <span className="bulkhead-label readout">{label}</span>
      <div className="bulkhead-door bulkhead-door-left" />
      <div className="bulkhead-door bulkhead-door-right" />
    </div>
  )
}
