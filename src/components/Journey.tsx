import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { DeckMap, deckRooms } from './art/Scenes'
import { SectionHeading } from './ui/SectionHeading'

const steps = [
  {
    room: 'Mess Hall',
    color: 'text-gold',
    title: 'Gather your crew',
    text: 'Join the Discord early, check your mic and meet the rest of your lobby. Solo players are matched with a crew, so nobody sits out.',
  },
  {
    room: 'Bridge',
    color: 'text-sky',
    title: 'Hear the briefing',
    text: 'The host explains the rules and settings, then runs a practice round so nobody starts cold. First-timers are very welcome.',
  },
  {
    room: 'Reactor',
    color: 'text-sus',
    title: 'Keep the ship alive',
    text: 'Crewmates finish their tasks while impostors sabotage. When the reactor alarm sounds, someone has to stabilise it, fast.',
    cta: true,
  },
  {
    room: 'Comms Deck',
    color: 'text-lime',
    title: 'Call the meeting',
    text: 'Report what you found or hit the emergency button. Share what you saw, argue your case, then vote. Skip if the evidence does not add up.',
  },
]

/**
 * Scroll tour: a sticky ship map on one side, four steps on the other. Whichever step
 * crosses the middle of the screen moves the crewmate to that room. All the text is
 * always on the page, and the room buttons give keyboard users a direct way to jump.
 */
export function Journey() {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step))
        })
      },
      // A thin band across the middle of the screen decides the current step.
      { rootMargin: '-45% 0px -45% 0px' },
    )
    stepRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const goTo = (index: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stepRefs.current[index]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <section id="journey" aria-labelledby="journey-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="journey-title"
        kicker="Ship tour"
        title="Walk the ship, round by round"
        intro="Scroll to follow a crewmate through one evening. The map moves with you, or pick a room to jump straight to it."
        accent="gold"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-14">
        <div className="sticky top-[4.5rem] z-10 self-start lg:top-28">
          <div className="panel p-3 sm:p-5">
            <DeckMap active={active} className="mx-auto h-[30vh] w-full lg:h-auto" />
            <div role="group" aria-label="Jump to a room" className="mt-3 flex flex-wrap gap-2">
              {deckRooms.map((room, i) => (
                <button
                  key={room.id}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => goTo(i)}
                  className={`min-h-10 cursor-pointer rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
                    i === active ? 'border-cream bg-panel text-cream' : 'border-line text-mute hover:border-mute hover:text-cream'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ol className="grid">
          {steps.map((step, i) => (
            <li
              key={step.room}
              ref={(el) => {
                stepRefs.current[i] = el
              }}
              data-step={i}
              className="flex min-h-[55vh] items-center py-6"
            >
              <div className={`panel w-full p-6 transition-all duration-500 md:p-8 ${i === active ? 'border-cream' : 'opacity-70'}`}>
                <p className={`readout mb-3 ${step.color}`}>
                  Step {i + 1} of {steps.length}: {step.room}
                </p>
                <h3 className="text-3xl font-bold">{step.title}</h3>
                <p className="mt-4 text-lg text-mute">{step.text}</p>
                {step.cta && (
                  <a href="#reactor" className="btn btn-ghost mt-6">
                    Try the reactor yourself <ArrowDown size={18} aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
