import { eventConfig } from '../config/event'
import { navLinks } from '../config/nav'
import { Logo } from './ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-line bg-hull/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <Logo name={eventConfig.name} />
          <p className="mt-4 max-w-xs text-mute">See you on the ship. Trust your gut, check your facts, and never vote alone.</p>
        </div>

        <nav aria-label="Footer">
          <p className="readout mb-4 text-gold">Navigate</p>
          <ul className="grid gap-2">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="text-mute hover:text-cream">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {eventConfig.socialLinks.length > 0 && (
          <div>
            <p className="readout mb-4 text-gold">Follow</p>
            <ul className="grid gap-2">
              {eventConfig.socialLinks.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-cream">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-line/70">
        <p className="mx-auto max-w-7xl px-5 py-6 text-sm text-mute md:px-8">
          Fan-made landing page. Among Us is a trademark of Innersloth LLC; this site is not affiliated with or endorsed by
          Innersloth. All illustrations are original SVG artwork. Fonts: Space Grotesk and Inter (SIL Open Font License). Icons:
          Lucide (ISC license).
        </p>
      </div>
    </footer>
  )
}
