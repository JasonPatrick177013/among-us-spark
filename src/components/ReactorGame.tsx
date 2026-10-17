import { useRef, useState } from 'react'
import { Radio, RotateCcw, Snowflake, Zap, type LucideIcon } from 'lucide-react'
import { Cadet } from './art/Cadet'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

type System = { id: string; name: string; hint: string; icon: LucideIcon; color: string; ring: string }

const systems: System[] = [
  { id: 'power', name: 'Power', hint: 'Start here. Everything else runs on it.', icon: Zap, color: 'text-gold', ring: '#ffcb3d' },
  { id: 'coolant', name: 'Coolant', hint: 'Needs power to circulate.', icon: Snowflake, color: 'text-sky', ring: '#3fd2ff' },
  { id: 'comms', name: 'Comms', hint: 'Needs coolant so the relays stay cool.', icon: Radio, color: 'text-lime', ring: '#6cf08a' },
]

const START_MESSAGE = 'Reactor offline. Bring the systems online in the right order.'

/**
 * Mini-game: bring Power, Coolant and Comms online, in that order. Pressing a system out of
 * order costs a misstep; switching one off shuts down everything after it. Plain buttons, so
 * it works with keyboard, touch and screen readers (status messages are announced).
 */
export function ReactorGame() {
  const [online, setOnline] = useState<boolean[]>([false, false, false])
  const [message, setMessage] = useState(START_MESSAGE)
  const [missteps, setMissteps] = useState(0)
  const [shakeIndex, setShakeIndex] = useState<number | null>(null)
  const [seconds, setSeconds] = useState<number | null>(null)
  const startedAt = useRef<number | null>(null)

  const count = online.filter(Boolean).length
  const done = count === systems.length
  const pct = done ? 100 : count * 34

  const press = (i: number) => {
    if (done) return
    const system = systems[i]

    // Pressing an online system switches it off, and everything after it too.
    if (online[i]) {
      setOnline(online.map((v, j) => (j >= i ? false : v)))
      setMessage(i === systems.length - 1 ? `${system.name} offline.` : `${system.name} offline. The systems after it shut down too.`)
      return
    }

    // Out of order: nothing to run on.
    if (i > 0 && !online[i - 1]) {
      setMissteps((m) => m + 1)
      setShakeIndex(i)
      setMessage(`${system.name} has nothing to run on. Bring ${systems[i - 1].name} online first.`)
      return
    }

    if (startedAt.current === null) startedAt.current = Date.now()
    const next = online.map((v, j) => (j === i ? true : v))
    setOnline(next)
    if (next.every(Boolean)) {
      setSeconds(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)))
      setMessage('Reactor stable. All three systems are online.')
    } else {
      setMessage(`${system.name} online. ${systems[i + 1].name} is next.`)
    }
  }

  const reset = () => {
    setOnline([false, false, false])
    setMessage(START_MESSAGE)
    setMissteps(0)
    setShakeIndex(null)
    setSeconds(null)
    startedAt.current = null
  }

  const coreColor = done ? '#6cf08a' : '#ff4f63'

  return (
    <section id="reactor" aria-labelledby="reactor-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="reactor-title"
        kicker="Mini-game"
        title="Stabilise the reactor"
        intro="Three systems, one order. Bring Power, Coolant and Comms online to steady the core. Switch one off and everything after it shuts down too."
        accent="sus"
      />

      <Reveal>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* the reactor core */}
          <div className="panel p-6 sm:p-8">
            <svg viewBox="0 0 320 320" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label={`Reactor core at ${pct} percent output`}>
              <circle cx="160" cy="160" r="152" fill="#0b0a2a" stroke="#3b2f9a" strokeWidth="4" />
              <g className="orbit" opacity=".55">
                <circle cx="160" cy="160" r="142" fill="none" stroke="#b690ff" strokeWidth="2" strokeDasharray="3 10" />
              </g>
              {[128, 98, 68].map((r, i) => (
                <circle
                  key={r}
                  cx="160"
                  cy="160"
                  r={r}
                  fill="none"
                  strokeWidth="12"
                  stroke={online[i] ? systems[i].ring : '#2b2370'}
                  style={{ filter: online[i] ? `drop-shadow(0 0 8px ${systems[i].ring})` : 'none', transition: 'stroke 0.4s ease, filter 0.4s ease' }}
                />
              ))}
              <circle
                className={done ? 'core-pulse' : undefined}
                cx="160"
                cy="160"
                r="40"
                fill={coreColor}
                style={{ opacity: 0.06 + (pct / 100) * 0.3, transition: 'opacity 0.5s ease' }}
              />
              <circle cx="160" cy="160" r="40" fill="none" stroke={coreColor} strokeWidth="5" style={{ opacity: 0.3 + (pct / 100) * 0.7, transition: 'opacity 0.5s ease' }} />
              <text x="160" y="170" textAnchor="middle" fontSize="28" fontWeight="700" fill="#FFE5D1" fontFamily="'Space Grotesk Variable', ui-sans-serif, sans-serif">
                {pct}%
              </text>
            </svg>
            <div
              role="progressbar"
              aria-label="Core output"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="mx-auto mt-4 h-3 w-full max-w-sm overflow-hidden rounded-full bg-void"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-lime' : 'bg-sus'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* the controls */}
          <div>
            <div className="grid gap-3">
              {systems.map((s, i) => {
                const Icon = s.icon
                const on = online[i]
                const locked = i > 0 && !online[i - 1] && !on
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    aria-describedby={`reactor-hint-${s.id}`}
                    onClick={() => press(i)}
                    onAnimationEnd={() => shakeIndex === i && setShakeIndex(null)}
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors ${
                      on ? 'border-lime bg-panel' : locked ? 'border-dashed border-line bg-hull' : 'border-line bg-hull hover:border-mute'
                    } ${shakeIndex === i ? 'shake' : ''}`}
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-void ${s.color}`}>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold">{s.name}</span>
                      <span id={`reactor-hint-${s.id}`} className="block text-sm text-mute">
                        {s.hint}
                      </span>
                    </span>
                    <span className={`readout ${on ? 'text-lime' : 'text-mute'}`}>{on ? 'Online' : 'Offline'}</span>
                  </button>
                )
              })}
            </div>

            <p role="status" className="mt-5 min-h-[3.5rem] text-lg text-mute">
              {message}
            </p>

            {done && seconds !== null && (
              <div className="mt-2 flex items-center gap-4 rounded-2xl border-2 border-lime bg-panel p-4">
                <Cadet suit="green" pose="cheer" className="h-20 w-auto shrink-0" />
                <p className="text-cream">
                  <strong className="font-display">Reactor stable.</strong> Stabilised in {seconds} {seconds === 1 ? 'second' : 'seconds'}{' '}
                  {missteps === 0 ? 'with no missteps.' : `with ${missteps} ${missteps === 1 ? 'misstep' : 'missteps'}.`}
                </p>
              </div>
            )}

            <button type="button" onClick={reset} className="btn btn-ghost mt-5">
              <RotateCcw size={18} aria-hidden="true" /> Reset reactor
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
