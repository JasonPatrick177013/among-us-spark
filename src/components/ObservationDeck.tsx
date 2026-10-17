import { useRef, useState, type KeyboardEvent } from 'react'
import { DebrisScene, OrbitScene, PlanetScene, StationScene } from './art/Scenes'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

const scenes = [
  {
    id: 'orbit',
    label: 'The Meridian',
    caption: 'Our ship, holding a steady orbit. One cadet insists on a spacewalk between rounds and nobody can talk them out of it.',
    Scene: OrbitScene,
  },
  {
    id: 'planet',
    label: 'Kepler view',
    caption: 'A ringed gas giant with a warm orange moon. The crew calls this the best seat in the house.',
    Scene: PlanetScene,
  },
  {
    id: 'station',
    label: 'Halo station',
    caption: 'A quiet relay station with a docked pod. Its lights blink in a pattern nobody has cracked yet.',
    Scene: StationScene,
  },
  {
    id: 'debris',
    label: 'Debris field',
    caption: 'Rock and a broken solar panel drifting past a small sun. Keep your tether short out here.',
    Scene: DebrisScene,
  },
]

/** Four original SVG windows onto the world outside the ship. Tabs, arrow keys and a caption for each. */
export function ObservationDeck() {
  const [index, setIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const current = scenes[index]
  const Scene = current.Scene

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = scenes.length - 1
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (i + 1) % scenes.length
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (i - 1 + scenes.length) % scenes.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    setIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="deck" aria-labelledby="deck-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="deck-title"
        kicker="Observation deck"
        title="Take a look outside"
        intro="Pick a window. Between rounds, this is where the crew goes to cool down and get suspicious again."
        accent="sky"
      />

      <Reveal>
        <div className="panel overflow-hidden">
          <div role="tablist" aria-label="Observation windows" className="flex flex-wrap gap-2 border-b-2 border-line p-3 sm:p-4">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                type="button"
                id={`deck-tab-${s.id}`}
                aria-selected={i === index}
                aria-controls="deck-panel"
                tabIndex={i === index ? 0 : -1}
                onClick={() => setIndex(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`min-h-10 cursor-pointer rounded-lg border-2 px-4 py-1.5 font-display font-semibold transition-colors ${
                  i === index ? 'border-cream bg-panel text-cream' : 'border-line text-mute hover:border-mute hover:text-cream'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id="deck-panel" aria-labelledby={`deck-tab-${current.id}`} tabIndex={0}>
            <div key={current.id} className="scene-in">
              <Scene />
            </div>
            <p className="border-t-2 border-line px-5 py-4 text-mute sm:px-7">{current.caption}</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
