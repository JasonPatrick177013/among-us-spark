type LogoProps = { name: string }

/** Event identity: a tiny emergency-button mark plus the event name. */
export function Logo({ name }: LogoProps) {
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#141A40" />
        <ellipse cx="32" cy="44" rx="22" ry="8" fill="#FFD166" />
        <path d="M10 44v-6a22 8 0 0 1 44 0v6a22 8 0 0 1-44 0z" fill="#2A3270" />
        <path d="M16 38c0-10 7-18 16-18s16 8 16 18z" fill="#F45858" />
        <path d="M23 33c1-5 4-8 8-9" stroke="#FFE5D1" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight max-[360px]:hidden">{name}</span>
    </span>
  )
}
