import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useActiveSection } from '../hooks/useActiveSection'
import { Cadet, type CadetPose } from './art/Cadet'

const stops = [
  { id: 'top', label: 'Top', quip: "Let's go!", tone: '#ff4f63' },
  { id: 'event', label: 'Event', quip: 'The details!', tone: '#ffcb3d' },
  { id: 'journey', label: 'Ship tour', quip: 'Ship tour!', tone: '#3fd2ff' },
  { id: 'schedule', label: 'Schedule', quip: 'Flight plan!', tone: '#6cf08a' },
  { id: 'missions', label: 'Missions', quip: 'Tasks, tasks!', tone: '#b690ff' },
  { id: 'reactor', label: 'Reactor', quip: "Don't blow it!", tone: '#ff4f63' },
  { id: 'register', label: 'Register', quip: 'Join us!', tone: '#6cf08a' },
  { id: 'faq', label: 'FAQ', quip: 'Any questions?', tone: '#3fd2ff' },
]

const SPARKS = 10
const sparkColors = ['#ff4f63', '#ffcb3d', '#3fd2ff', '#6cf08a', '#b690ff']
const burstAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)

/**
 * A progress rail on the right edge (laptop screens and up). A little cadet rides it as you scroll:
 *  - it follows the page on a springy motion, so it overshoots and settles instead of sliding stiffly
 *  - it leans, stretches and squashes with scroll speed, and leaves a trail of sparks
 *  - it points when you scroll down, waves when you scroll up, and cheers on arrival
 *  - each stop pops with a confetti burst, takes its section colour, and the cadet says something silly
 * Every stop is still a plain link. For reduced-motion users the cadet just moves, with no springs,
 * sparks, bursts or speech bubbles.
 */
export function ScrollRail() {
  const markerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const sparkRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [idx, setIdx] = useState(0)
  const [pose, setPose] = useState<CadetPose>('idle')
  const [bubble, setBubble] = useState<{ key: number; text: string } | null>(null)
  const [burst, setBurst] = useState<{ key: number; at: number } | null>(null)
  const active = useActiveSection(stops.map((s) => s.id))

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // All the moving numbers live here, outside React state, so scrolling never re-renders the rail.
    const s = {
      target: 0, // where the page says the cadet should be (0 to 100, percent down the rail)
      pos: 0, // where the cadet is right now
      vel: 0,
      lastSpark: 0,
      spark: 0,
      idx: -1,
      count: 0,
      cheerUntil: 0,
      pose: 'idle' as CadetPose,
      dirty: true,
    }
    let raf = 0
    const timers: number[] = []

    const choosePose = () => {
      const next: CadetPose =
        performance.now() < s.cheerUntil ? 'cheer' : Math.abs(s.vel) > 0.3 ? (s.vel > 0 ? 'point' : 'wave') : 'idle'
      if (next !== s.pose) {
        s.pose = next
        setPose(next)
      }
    }

    const celebrate = (i: number) => {
      s.count += 1
      const key = s.count
      s.cheerUntil = performance.now() + 1100
      setBurst({ key, at: i })
      setBubble({ key, text: stops[i].quip })
      timers.push(window.setTimeout(() => setBurst((b) => (b && b.key === key ? null : b)), 900))
      timers.push(window.setTimeout(() => setBubble((b) => (b && b.key === key ? null : b)), 1800))
      timers.push(window.setTimeout(choosePose, 1150))
    }

    const measure = () => {
      const tops = stops.map((stop) => {
        const el = document.getElementById(stop.id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      })
      const y = window.scrollY + window.innerHeight * 0.35
      let i = 0
      for (let k = 0; k < tops.length; k += 1) {
        if (y >= tops[k]) i = k
      }
      const span = i < tops.length - 1 ? tops[i + 1] - tops[i] : 0
      const f = span > 0 ? Math.min(1, Math.max(0, (y - tops[i]) / span)) : 0
      s.target = ((i + f) / (stops.length - 1)) * 100
      if (i !== s.idx) {
        const first = s.idx === -1
        s.idx = i
        setIdx(i)
        if (!first && !reduce) celebrate(i)
      }
    }

    const render = () => {
      const marker = markerRef.current
      const body = bodyRef.current
      const fill = fillRef.current
      if (!marker || !body || !fill) return
      marker.style.top = `${s.pos}%`
      fill.style.height = `${Math.max(0, s.pos)}%`
      if (reduce) return
      // Squash and stretch: faster scrolling makes the cadet longer, thinner and tilted into the move.
      const stretch = 1 + Math.min(0.32, Math.abs(s.vel) * 0.1)
      const tilt = Math.max(-24, Math.min(24, s.vel * 16))
      body.style.transform = `rotate(${tilt}deg) scale(${1 - (stretch - 1) * 0.6}, ${stretch})`
    }

    const emitSpark = () => {
      const el = sparkRefs.current[s.spark % SPARKS]
      s.spark += 1
      if (!el) return
      const trailing = s.vel >= 0 ? -1 : 1
      el.style.top = `${s.pos}%`
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 36}px`)
      el.style.setProperty('--dy', `${trailing * (8 + Math.random() * 22)}px`)
      el.style.setProperty('--c', sparkColors[s.spark % sparkColors.length])
      el.classList.remove('is-live')
      void el.offsetWidth // restart the animation
      el.classList.add('is-live')
    }

    const tick = () => {
      raf = 0
      if (s.dirty) {
        s.dirty = false
        measure()
      }
      if (reduce) {
        s.pos = s.target
        s.vel = 0
      } else {
        // A bouncy spring: pulled toward the target, with just enough damping to overshoot a little (about 12%) and settle in under a second.
        s.vel += (s.target - s.pos) * 0.1
        s.vel *= 0.72
        s.pos += s.vel
      }
      s.pos = Math.min(103, Math.max(-3, s.pos))
      render()
      if (!reduce && Math.abs(s.pos - s.lastSpark) > 1.4 && Math.abs(s.vel) > 0.15) {
        s.lastSpark = s.pos
        emitSpark()
      }
      choosePose()
      if (Math.abs(s.target - s.pos) > 0.03 || Math.abs(s.vel) > 0.03) {
        raf = requestAnimationFrame(tick)
      } else {
        s.pos = s.target
        s.vel = 0
        render()
        choosePose()
      }
    }

    const wake = () => {
      s.dirty = true
      if (!raf) raf = requestAnimationFrame(tick)
    }

    measure()
    s.pos = s.target
    render()
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', wake)
    return () => {
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', wake)
      if (raf) cancelAnimationFrame(raf)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return (
    <nav aria-label="Page progress" className="fixed right-3 top-1/2 z-40 hidden h-[56vh] -translate-y-1/2 lg:block">
      <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded bg-line" aria-hidden="true">
        <div ref={fillRef} className="rail-fill w-full rounded" style={{ height: 0 }} />
      </div>

      {stops.map((stop, i) => {
        const reached = i <= idx
        const here = i === idx
        const popKey = burst && burst.at === i ? burst.key : null
        return (
          <a
            key={stop.id}
            href={`#${stop.id}`}
            aria-label={`Go to ${stop.label}`}
            aria-current={active === stop.id ? 'location' : undefined}
            className="group absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ top: `${(i / (stops.length - 1)) * 100}%` }}
          >
            {here && <span aria-hidden="true" className="rail-ring absolute inset-0 rounded-full border-2" style={{ borderColor: stop.tone }} />}
            <span
              key={popKey === null ? 'dot' : `pop-${popKey}`}
              className={`relative h-3 w-3 rounded-full border-2 transition-transform duration-300 ${here ? 'scale-125' : ''} ${
                popKey === null ? '' : 'rail-pop'
              } ${reached ? '' : 'border-mute bg-void group-hover:border-cream'}`}
              style={reached ? { background: stop.tone, borderColor: stop.tone, boxShadow: `0 0 10px ${stop.tone}` } : undefined}
            />
            {popKey !== null && (
              <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                {burstAngles.map((angle, k) => (
                  <span
                    key={k}
                    className="rail-burst-bit"
                    style={{ '--bx': `${Math.cos(angle) * 26}px`, '--by': `${Math.sin(angle) * 26}px`, '--c': sparkColors[k % sparkColors.length] } as CSSProperties}
                  />
                ))}
              </span>
            )}
            <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-md border border-line bg-hull px-2 py-1 text-xs font-semibold text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {stop.label}
            </span>
          </a>
        )
      })}

      {/* the spark trail: a small pool of stars that get reused as the cadet moves */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: SPARKS }, (_, k) => (
          <span
            key={k}
            ref={(el) => {
              sparkRefs.current[k] = el
            }}
            className="rail-spark"
          />
        ))}
      </div>

      <div ref={markerRef} className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ top: 0 }} aria-hidden="true">
        <div className="rail-bob">
          <div ref={bodyRef} style={{ transformOrigin: '50% 60%' }}>
            <Cadet suit="red" pose={pose} className="h-10 w-auto drop-shadow-[0_0_8px_rgb(255_79_99/0.8)]" />
          </div>
        </div>
        {bubble && (
          <span
            key={bubble.key}
            className="rail-bubble absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-xl border-2 border-gold bg-cream px-3 py-1 text-sm font-bold text-void shadow-lg"
          >
            {bubble.text}
          </span>
        )}
      </div>
    </nav>
  )
}
