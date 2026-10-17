type SectionHeadingProps = {
  id: string
  kicker: string
  title: string
  intro?: string
  accent?: 'sus' | 'gold' | 'sky' | 'lime' | 'violet'
}

const accents = {
  sus: 'text-sus',
  gold: 'text-gold',
  sky: 'text-sky',
  lime: 'text-lime',
  violet: 'text-violet',
}

/** Shared section title: a mono "ship readout" kicker, a big heading, an optional intro. */
export function SectionHeading({ id, kicker, title, intro, accent = 'sus' }: SectionHeadingProps) {
  return (
    <header className="mb-10 max-w-2xl md:mb-14">
      <p className={`readout mb-3 flex items-center gap-3 ${accents[accent]}`}>
        <span className="h-px w-8 bg-current" aria-hidden="true" />
        {kicker}
      </p>
      <h2 id={id} className="text-4xl font-bold md:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg text-mute">{intro}</p>}
    </header>
  )
}
