import { useEffect, useRef } from 'react'
import { useActiveSection } from '../hooks/useActiveSection'
import { Cadet } from './art/Cadet'

const stops = [
  { id: 'top', label: 'Top' },
  { id: 'event', label: 'Event' },
  { id: 'journey', label: 'Ship tour' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'missions', label: 'Missions' },
  { id: 'reactor', label: 'Reactor' },
  { id: 'register', label: 'Register' },
  { id: 'faq', label: 'FAQ' },
]

/**
 * A progress rail on the right edge (laptop screens and up). A little cadet slides down the
 * rail as you scroll, passing a stop for each section, and every stop is a link you can click.
 */
export function ScrollRail() {
  const markerRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const active = useActiveSection(stops.map((s) => s.id))

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const marker = markerRef.current
      const fill = fillRef.current
      if (!marker || !fill) return
      const tops = stops.map((s) => {
        const el = document.getElementById(s.id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      })
      const y = window.scrollY + window.innerHeight * 0.35
      let i = 0
      for (let k = 0; k < tops.length; k += 1) {
        if (y >= tops[k]) i = k
      }
      const span = i < tops.length - 1 ? tops[i + 1] - tops[i] : 0
      const f = span > 0 ? Math.min(1, Math.max(0, (y - tops[i]) / span)) : 0
      const pct = ((i + f) / (stops.length - 1)) * 100
      marker.style.top = `${pct}%`
      fill.style.height = `${pct}%`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <nav aria-label="Page progress" className="fixed right-3 top-1/2 z-40 hidden h-[56vh] -translate-y-1/2 lg:block">
      <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded bg-line" aria-hidden="true">
        <div ref={fillRef} className="w-full rounded bg-gradient-to-b from-sus via-gold to-sky" style={{ height: 0 }} />
      </div>

      {stops.map((stop, i) => {
        const here = active === stop.id
        return (
          <a
            key={stop.id}
            href={`#${stop.id}`}
            aria-label={`Go to ${stop.label}`}
            aria-current={here ? 'location' : undefined}
            className="group absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ top: `${(i / (stops.length - 1)) * 100}%` }}
          >
            <span className={`h-3 w-3 rounded-full border-2 transition-colors ${here ? 'border-gold bg-gold' : 'border-mute bg-void group-hover:border-cream'}`} />
            <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-md border border-line bg-hull px-2 py-1 text-xs font-semibold text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {stop.label}
            </span>
          </a>
        )
      })}

      <div ref={markerRef} className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[top] duration-150 ease-out" style={{ top: 0 }} aria-hidden="true">
        <Cadet suit="red" pose="idle" className="h-10 w-auto drop-shadow-[0_0_8px_rgb(255_79_99/0.8)]" />
      </div>
    </nav>
  )
}
