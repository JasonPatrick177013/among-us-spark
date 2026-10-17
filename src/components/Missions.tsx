import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { ListChecks, Search, Siren, Swords, Users, type LucideIcon } from 'lucide-react'
import { Cadet, type CadetPose } from './art/Cadet'
import type { SuitName } from './art/palette'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

type Mission = {
  id: string
  title: string
  icon: LucideIcon
  color: string // Tailwind text color class
  suit: SuitName
  pose: CadetPose
  text: string
}

// These describe how Among Us is played. They make no claims about prizes, rounds or scoring.
const missions: Mission[] = [
  {
    id: 'tasks',
    title: 'Finish your tasks',
    icon: ListChecks,
    color: 'text-sky',
    suit: 'blue',
    pose: 'idle',
    text: 'Crew members keep the ship running by completing tasks in every corner of the map. Finish them all and the crew wins, so keep moving.',
  },
  {
    id: 'spot',
    title: 'Spot the impostor',
    icon: Search,
    color: 'text-sus',
    suit: 'red',
    pose: 'point',
    text: 'Someone on board is not who they claim to be. Watch who goes where, who is suspiciously quiet, and whose story does not add up.',
  },
  {
    id: 'meeting',
    title: 'Call the meeting',
    icon: Siren,
    color: 'text-gold',
    suit: 'yellow',
    pose: 'wave',
    text: 'Found something odd? Report it or hit the emergency button. The whole crew gathers to discuss, then votes on who gets ejected.',
  },
  {
    id: 'crew',
    title: 'Stick with your crew',
    icon: Users,
    color: 'text-lime',
    suit: 'green',
    pose: 'cheer',
    text: 'Trust is your best tool. Share what you saw, back up your claims, and work out together who deserves the vote.',
  },
  {
    id: 'outsmart',
    title: 'Outsmart them',
    icon: Swords,
    color: 'text-violet',
    suit: 'purple',
    pose: 'point',
    text: 'Impostors win through sabotage and deception. Crew wins through sharp eyes and good arguments. Pick your side of the lie.',
  },
]

export function Missions() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const active = missions[activeIndex]
  const ActiveIcon = active.icon

  // Arrow keys move between tasks (standard tab-list keyboard behavior).
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = missions.length - 1
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? (index + 1) % missions.length
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? (index - 1 + missions.length) % missions.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="missions" aria-labelledby="missions-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="missions-title"
        kicker="Task list"
        title="Your missions aboard"
        intro="Pick a task from the list to see what it is about. This is how the game plays out on the ship."
        accent="sky"
      />

      <Reveal>
        <div className="grid gap-6 lg:grid-cols-5">
          {/* The task list */}
          <div role="tablist" aria-label="Missions" aria-orientation="vertical" className="flex flex-col gap-3 lg:col-span-2">
            {missions.map((m, i) => {
              const Icon = m.icon
              const selected = i === activeIndex
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  role="tab"
                  type="button"
                  id={`mission-tab-${m.id}`}
                  aria-selected={selected}
                  aria-controls="mission-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                    selected
                      ? 'translate-x-1 border-cream bg-panel'
                      : 'border-line bg-hull hover:border-mute hover:bg-panel/60'
                  }`}
                >
                  <span className="readout w-14 shrink-0 text-mute">Task {String(i + 1).padStart(2, '0')}</span>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-void ${m.color}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="font-display text-lg font-semibold">{m.title}</span>
                </button>
              )
            })}
          </div>

          {/* The detail console */}
          <div
            role="tabpanel"
            id="mission-panel"
            aria-labelledby={`mission-tab-${active.id}`}
            tabIndex={0}
            className="panel relative flex min-h-[22rem] flex-col justify-between gap-8 overflow-hidden p-7 sm:flex-row sm:items-center lg:col-span-3 lg:p-10"
          >
            <div className="relative z-10 max-w-md">
              <p className={`readout mb-3 flex items-center gap-2 ${active.color}`}>
                <ActiveIcon size={16} aria-hidden="true" /> Task {String(activeIndex + 1).padStart(2, '0')} of {missions.length}
              </p>
              <h3 className="text-3xl font-bold md:text-4xl">{active.title}</h3>
              <p className="mt-4 text-lg text-mute">{active.text}</p>
            </div>
            <Cadet
              key={active.id}
              suit={active.suit}
              pose={active.pose}
              className="float mx-auto h-48 w-auto shrink-0 sm:h-56"
              style={{ '--tilt': '-4deg', '--dur': '6s' } as CSSProperties}
            />
          </div>
        </div>
      </Reveal>

      <p className="mt-6 text-sm text-mute">
        This section describes how Among Us is played. Event-specific rules, rounds and scoring will be published by the organizers.
      </p>
    </section>
  )
}
