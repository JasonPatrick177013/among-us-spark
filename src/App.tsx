import { Starfield } from './components/art/Starfield'
import { EventInfo } from './components/EventInfo'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Missions } from './components/Missions'
import { Navbar } from './components/Navbar'
import { Registration } from './components/Registration'

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
      <Navbar />
      <main>
        <Hero />
        <EventInfo />
        <Missions />
        <Registration />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
