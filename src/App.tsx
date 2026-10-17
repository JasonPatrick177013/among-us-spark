import { Starfield } from './components/art/Starfield'
import { CursorGlow } from './components/CursorGlow'
import { EventInfo } from './components/EventInfo'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Journey } from './components/Journey'
import { Missions } from './components/Missions'
import { Navbar } from './components/Navbar'
import { ObservationDeck } from './components/ObservationDeck'
import { ReactorGame } from './components/ReactorGame'
import { Registration } from './components/Registration'
import { Schedule } from './components/Schedule'
import { ScrollRail } from './components/ScrollRail'
import { SectionTransition } from './components/ui/SectionTransition'

export default function App() {
  return (
    <>
      <a
        href="#event"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-void"
      >
        Skip to event details
      </a>
      <Starfield />
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <SectionTransition label="Mission briefing" tone="gold" />
        <EventInfo />
        <SectionTransition label="Ship tour" tone="sky" />
        <Journey />
        <SectionTransition label="Observation deck" tone="violet" />
        <ObservationDeck />
        <SectionTransition label="Flight plan" tone="lime" />
        <Schedule />
        <SectionTransition label="Task list" tone="gold" />
        <Missions />
        <SectionTransition label="Reactor bay" tone="sus" />
        <ReactorGame />
        <SectionTransition label="Boarding gate" tone="lime" />
        <Registration />
        <SectionTransition label="Comms" tone="sky" />
        <Faq />
      </main>
      <Footer />
      <ScrollRail />
    </>
  )
}
