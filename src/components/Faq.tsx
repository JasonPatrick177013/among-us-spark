import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { eventConfig } from '../config/event'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

const { registration } = eventConfig
const registrationAnswer = registration.externalFormUrl
  ? 'Use the registration button on this page. It opens the organizers\' official form in a new tab.'
  : registration.endpoint
    ? 'Fill in the form on this page and submit it. Your entry goes straight to the organizers.'
    : 'The form on this page is currently a demo that only checks your answers. Real registration opens when the organizers connect a sign-up service.'

const TBA = 'Not announced yet. This will be confirmed by the organizers.'

const faqs = [
  {
    q: 'Who can participate?',
    a: 'Anyone aged 13 or older can join, whether you are a first-time crewmate or a veteran impostor. Students, friends and whole squads are welcome, and solo players will be matched into a lobby on the day.',
  },
  {
    q: 'Do I need to own Among Us?',
    a: 'Yes, each player needs their own copy of the game on PC or mobile. Players on different platforms can usually share a lobby. Please update the game before the event starts.',
  },
  { q: 'How does registration work?', a: registrationAnswer },
  { q: 'Is the event online?', a: eventConfig.details.format ? `Format: ${eventConfig.details.format}.` : TBA },
  {
    q: 'What happens after I register?',
    a: "You'll receive a confirmation message, a lobby assignment and a short rules briefing before the event. On the day, join the voice channel 15 minutes early so the host can run a quick check-in and share the lobby code.",
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading id="faq-title" kicker="Intel" title="Questions, answered" accent="lime" />

      <Reveal>
        <div className="grid gap-3">
          {faqs.map((item, i) => {
            const open = openIndex === i
            return (
              <div key={item.q} className="rounded-2xl border-2 border-line bg-hull">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left font-display text-lg font-semibold"
                  >
                    {item.q}
                    <ChevronDown
                      size={22}
                      aria-hidden="true"
                      className={`shrink-0 text-lime transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!open} className="px-6 pb-5 text-mute">
                  {item.a}
                </div>
              </div>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
