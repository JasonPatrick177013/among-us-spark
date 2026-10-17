import { useEffect, useState } from 'react'
import { Menu, Rocket, X } from 'lucide-react'
import { eventConfig } from '../config/event'
import { navLinks } from '../config/nav'
import { useActiveSection } from '../hooks/useActiveSection'
import { MusicPlayer } from './MusicPlayer'
import { Logo } from './ui/Logo'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const active = useActiveSection(navLinks.map((l) => l.id))

  // Escape closes the mobile menu (keyboard users expect this).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass = (id: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-cream ${
      active === id ? 'text-cream' : 'text-mute'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-void/85 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" aria-label={`${eventConfig.name}, back to top`} className="rounded-lg">
          <Logo name={eventConfig.name} />
        </a>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={linkClass(link.id)}
                  aria-current={active === link.id ? 'location' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="ml-3">
              <a href="#register" className="btn btn-primary !min-h-10 !px-4 !py-2 !text-sm">
                <Rocket size={16} aria-hidden="true" /> Join the crew
              </a>
            </li>
          </ul>

          {/* Ship radio: on/off, change song, credits */}
          <MusicPlayer />

          {/* Mobile menu button */}
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-lg border border-line md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-hull md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-lg font-medium text-cream hover:bg-panel"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#register" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                <Rocket size={18} aria-hidden="true" /> Join the crew
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
