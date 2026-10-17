import { ArrowDown, Rocket } from 'lucide-react'
import { eventConfig, PLACEHOLDER_LABEL } from '../config/event'
import { goToRegistration } from '../lib/goToRegistration'
import { ShipWindow } from './art/ShipWindow'

/** The three little status readouts under the hero copy. Unknown values show as placeholders, never as facts. */
function StatusReadouts() {
  const items = [
    { label: 'Date', value: eventConfig.details.date },
    { label: 'Format', value: eventConfig.details.format },
    { label: 'Game', value: eventConfig.details.gameMode },
  ]
  return (
    <dl className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-line bg-hull/70 px-4 py-3">
          <dt className="readout text-mute">{item.label}</dt>
          <dd className={`mt-1 font-display text-base font-semibold ${item.value ? 'text-cream' : 'text-gold'}`}>
            {item.value ?? PLACEHOLDER_LABEL}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 md:px-8 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-8"
    >
      <div className="lg:col-span-6">
        <p className="readout inline-flex items-center gap-3 rounded-full border border-sus/50 bg-sus/10 px-4 py-2 text-sus">
          <span className="blink h-2 w-2 rounded-full bg-sus" aria-hidden="true" />
          {eventConfig.name} · {eventConfig.tagline}
        </p>

        <h1 id="hero-title" className="mt-6 text-5xl font-bold sm:text-6xl xl:text-7xl">
          Trust no one.
          <br />
          Find the <span className="text-sus">impostor.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-mute md:text-xl">{eventConfig.description}</p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a href="#register" className="btn btn-primary">
            <Rocket size={20} aria-hidden="true" /> Register now
          </a>
          <a href="#event" className="btn btn-ghost">
            <ArrowDown size={20} aria-hidden="true" /> Event details
          </a>
        </div>

        <StatusReadouts />
      </div>

      {/* Illustration + the real emergency button */}
      <div className="lg:col-span-6">
        <div className="relative mx-auto max-w-[34rem]">
          <ShipWindow />

          <button
            type="button"
            onClick={goToRegistration}
            aria-label="Press the emergency button to jump to registration"
            className="group absolute left-1/2 top-[87%] h-[17%] w-[22%] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full bg-sus/40 [animation:pulse-ring_2.4s_ease-out_infinite]" aria-hidden="true" />
            <span
              className="absolute inset-x-0 bottom-0 h-[38%] rounded-full border-2 border-void bg-[repeating-linear-gradient(135deg,#FFD166_0_9px,#070A1A_9px_18px)]"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-[22%] left-1/2 h-[62%] w-[72%] -translate-x-1/2 rounded-t-full border-2 border-void bg-sus shadow-[inset_0_8px_0_rgb(255_255_255/0.25)] transition-transform duration-100 group-hover:bg-[#ff6f6f] group-active:translate-y-2"
              aria-hidden="true"
            />
          </button>
        </div>
        <p className="readout mt-5 text-center text-mute">Press the emergency button to register</p>
      </div>
    </section>
  )
}
