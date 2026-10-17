import { useRef, useState, type KeyboardEvent } from 'react'
import { Cable, CircleCheck, Crown, Rocket, Siren, type LucideIcon } from 'lucide-react'
import { useCrew } from '../context/CrewContext'
import { goToRegistration } from '../lib/goToRegistration'
import { MeetingGame } from './games/MeetingGame'
import { WiresGame } from './games/WiresGame'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

type TaskId = 'wires' | 'meeting'
const tasks: { id: TaskId; title: string; blurb: string; icon: LucideIcon; color: string }[] = [
  { id: 'wires', title: 'Fix the wiring', blurb: 'Match every connector to its twin.', icon: Cable, color: 'text-gold' },
  { id: 'meeting', title: 'Emergency meeting', blurb: 'Cross-check the log, then eject the liar.', icon: Siren, color: 'text-sus' },
]

/**
 * The command deck: two playable tasks. Finishing both unlocks the golden crown in the crew lab,
 * and the progress is shown with a real progressbar. Games report back through `onComplete`.
 */
export function CommandDeck() {
  const { unlock } = useCrew()
  const [active, setActive] = useState<TaskId>('wires')
  const [done, setDone] = useState<TaskId[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const complete = (id: TaskId) => {
    if (done.includes(id)) return
    const next = [...done, id]
    setDone(next)
    if (next.length === tasks.length) unlock()
  }

  const allDone = done.length === tasks.length

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + tasks.length) % tasks.length
    setActive(tasks[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="command-deck" aria-labelledby="cmd-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="cmd-title"
        kicker="Mini-games"
        title="Command deck"
        intro="Two tasks need a pair of hands. Fix the wiring, then call an emergency meeting: you can even sabotage the cameras and vote in the dark. Finish both to unlock something in the crew lab."
        accent="gold"
      />

      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="min-w-[14rem] flex-1">
            <div className="readout mb-2 flex justify-between text-mute">
              <span>Tasks complete</span>
              <span>
                {done.length} / {tasks.length}
              </span>
            </div>
            <div role="progressbar" aria-label="Tasks complete" aria-valuemin={0} aria-valuemax={tasks.length} aria-valuenow={done.length} className="h-3 overflow-hidden rounded-full bg-void">
              <div className={`h-full rounded-full transition-[width] duration-500 ${allDone ? 'bg-lime' : 'bg-gold'}`} style={{ width: `${(done.length / tasks.length) * 100}%` }} />
            </div>
          </div>
          {allDone && (
            <p className="flex items-center gap-2 rounded-full border border-gold px-4 py-2 text-sm text-gold" role="status">
              <Crown size={16} aria-hidden="true" /> Golden crown unlocked in the crew lab
            </p>
          )}
        </div>

        <div role="tablist" aria-label="Command deck tasks" className="mb-6 grid gap-3 sm:grid-cols-2">
          {tasks.map((t, i) => {
            const Icon = t.icon
            const selected = active === t.id
            const finished = done.includes(t.id)
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                type="button"
                id={`cmd-tab-${t.id}`}
                aria-selected={selected}
                aria-controls="cmd-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors ${
                  selected ? 'border-cream bg-panel' : 'border-line bg-hull hover:border-mute'
                }`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-void ${t.color}`}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold">{t.title}</span>
                  <span className="block text-sm text-mute">{t.blurb}</span>
                </span>
                {finished && (
                  <span className="flex items-center gap-1 text-lime">
                    <CircleCheck size={22} aria-hidden="true" />
                    <span className="sr-only">Completed</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id="cmd-panel" aria-labelledby={`cmd-tab-${active}`} tabIndex={0}>
          {active === 'wires' ? <WiresGame onComplete={() => complete('wires')} /> : <MeetingGame onComplete={() => complete('meeting')} />}
        </div>

        {allDone && (
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-lime bg-panel p-5">
            <p className="min-w-[14rem] flex-1 text-cream">
              <strong className="font-display">Both tasks done.</strong> Now make it official and put your name on the crew manifest.
            </p>
            <button type="button" className="btn btn-primary" onClick={goToRegistration}>
              <Rocket size={18} aria-hidden="true" /> Register now
            </button>
          </div>
        )}
      </Reveal>
    </section>
  )
}
