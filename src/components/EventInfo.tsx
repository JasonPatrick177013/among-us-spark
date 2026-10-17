import type { CSSProperties } from 'react'
import { CalendarDays, ClipboardCheck, Clock, Gamepad2, Globe, MapPin, Users, type LucideIcon } from 'lucide-react'
import { eventConfig, PLACEHOLDER_LABEL, type EventDetailKey } from '../config/event'
import { useCountdown } from '../hooks/useCountdown'
import { Cadet } from './art/Cadet'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

type DetailMeta = { key: EventDetailKey; label: string; icon: LucideIcon; tint: string }

const detailMeta: DetailMeta[] = [
  { key: 'date', label: 'Date', icon: CalendarDays, tint: 'text-sus' },
  { key: 'time', label: 'Start time & time zone', icon: Clock, tint: 'text-gold' },
  { key: 'format', label: 'Format', icon: Globe, tint: 'text-sky' },
  { key: 'venue', label: 'Venue / platform', icon: MapPin, tint: 'text-lime' },
  { key: 'gameMode', label: 'Game', icon: Gamepad2, tint: 'text-violet' },
  { key: 'players', label: 'Players', icon: Users, tint: 'text-sus' },
  { key: 'registration', label: 'Registration', icon: ClipboardCheck, tint: 'text-gold' },
]

function DetailRow({ meta }: { meta: DetailMeta }) {
  const value = eventConfig.details[meta.key]
  const Icon = meta.icon
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-line bg-hull px-5 py-4">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-panel ${meta.tint}`}>
        <Icon size={24} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="readout text-mute">{meta.label}</dt>
        <dd className="mt-0.5 font-display text-lg font-semibold">
          {value ? (
            value
          ) : (
            <span
              className="inline-block rounded-md border border-dashed border-gold/70 px-2 py-0.5 text-base text-gold"
              title="Placeholder: edit src/config/event.ts"
            >
              {PLACEHOLDER_LABEL}
            </span>
          )}
        </dd>
      </div>
    </div>
  )
}

/** Only rendered when `startsAtISO` is a valid date in the future. No fake timers. */
function CountdownPanel() {
  const left = useCountdown(eventConfig.startsAtISO)
  if (!left) return null
  const cells = [
    ['Days', left.days],
    ['Hours', left.hours],
    ['Min', left.minutes],
    ['Sec', left.seconds],
  ] as const
  return (
    <div className="panel mb-6 p-6">
      <p className="readout mb-4 text-sus">Time until start</p>
      <div className="grid grid-cols-4 gap-2 text-center" role="timer" aria-label="Countdown to event start">
        {cells.map(([label, n]) => (
          <div key={label} className="rounded-xl bg-panel py-3">
            <div className="font-display text-3xl font-bold tabular-nums">{String(n).padStart(2, '0')}</div>
            <div className="readout text-mute">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventInfo() {
  const hasPlaceholders = Object.values(eventConfig.details).some((v) => v === null)

  return (
    <section id="event" aria-labelledby="event-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="event-title"
        kicker="Mission briefing"
        title="What, when and where"
        intro="Everything you need to know before you board. Anything still unconfirmed is clearly marked instead of guessed."
        accent="gold"
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            {detailMeta.map((meta, i) => (
              <div key={meta.key} className={i === detailMeta.length - 1 ? 'sm:col-span-2' : ''}>
                <DetailRow meta={meta} />
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.15}>
          <CountdownPanel />
          <div className="panel relative overflow-hidden p-6">
            <Cadet suit="yellow" pose="point" className="float mx-auto h-40 w-auto" style={{ '--dur': '7s' } as CSSProperties} />
            <p className="readout mt-5 text-gold">Comms status</p>
            <p className="mt-2 text-mute">
              {hasPlaceholders
                ? 'Details marked "To be announced" are placeholders. The organizers have not confirmed them yet.'
                : 'All details above are confirmed by the organizers.'}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
