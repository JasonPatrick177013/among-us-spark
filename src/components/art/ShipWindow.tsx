import type { CSSProperties } from 'react'
import { useCrew } from '../../context/CrewContext'
import { Cadet } from './Cadet'
import type { SuitName } from './palette'

/** The two background cadets keep their usual colours unless the visitor picked one of them. */
function companions(player: SuitName): [SuitName, SuitName] {
  const pool: SuitName[] = ['green', 'blue', 'yellow', 'purple']
  const free = pool.filter((s) => s !== player)
  return [free[0], free[1]]
}

/**
 * Hero illustration: a spaceship viewport with planets, orbit lines and three cadets
 * gathered behind the meeting console. Pure SVG, so it stays sharp at any size and
 * has a fixed aspect ratio (no layout shift while the page loads).
 */
export function ShipWindow() {
  const { suit, accessory } = useCrew()
  const [left, right] = companions(suit)
  return (
    <svg viewBox="0 0 560 500" className="h-auto w-full" role="img" aria-label="Illustration: cadets gathered at a spaceship window overlooking two planets">
      <defs>
        <linearGradient id="space" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A0F33" />
          <stop offset="1" stopColor="#1B1450" />
        </linearGradient>
        <clipPath id="viewport">
          <rect x="30" y="28" width="500" height="320" rx="56" />
        </clipPath>
        <pattern id="hazard" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="24" fill="#FFD166" />
          <rect x="12" width="12" height="24" fill="#070A1A" />
        </pattern>
      </defs>

      {/* window frame */}
      <rect x="12" y="10" width="536" height="356" rx="70" fill="#1B2250" stroke="#3A447F" strokeWidth="4" />
      <rect x="30" y="28" width="500" height="320" rx="56" fill="url(#space)" />

      {/* everything inside the window is clipped to its shape */}
      <g clipPath="url(#viewport)">
        {/* distant stars */}
        {[
          [80, 70], [140, 300], [230, 60], [300, 130], [360, 300], [470, 70], [500, 220], [110, 190], [270, 250], [430, 160],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.2} fill="#FFE5D1" className={i % 2 ? 'star' : undefined} style={{ '--delay': `${i * 0.4}s` } as CSSProperties} opacity={i % 2 ? undefined : 0.7} />
        ))}

        {/* orbit lines */}
        <g fill="none" stroke="#B8A5F5" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="4 8">
          <ellipse cx="170" cy="150" rx="150" ry="52" transform="rotate(-18 170 150)" />
          <ellipse cx="420" cy="120" rx="170" ry="60" transform="rotate(14 420 120)" />
        </g>

        {/* ringed blue planet */}
        <g className="float" style={{ '--dur': '9s' } as CSSProperties}>
          <ellipse cx="170" cy="150" rx="86" ry="22" fill="none" stroke="#67C9F5" strokeWidth="9" transform="rotate(-18 170 150)" opacity=".45" />
          <circle cx="170" cy="150" r="50" fill="#67C9F5" />
          <path d="M130 130q40 14 82-4M124 158q46 16 92-2" stroke="#3E9BD0" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7" />
          <path d="M120 150a52 52 0 0 1 36-42" stroke="#fff" strokeOpacity=".4" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* front half of the ring passes over the planet */}
          <path d="M84 150A86 22 0 0 0 256 150" fill="none" stroke="#9BDDFB" strokeWidth="9" transform="rotate(-18 170 150)" />
        </g>

        {/* big warm planet */}
        <g className="float" style={{ '--dur': '11s', '--delay': '1s' } as CSSProperties}>
          <circle cx="425" cy="118" r="62" fill="#F4936A" />
          <path d="M370 96q50 12 112-6M364 124q56 14 122-2M376 152q46 10 96-4" stroke="#D8704C" strokeWidth="8" strokeLinecap="round" fill="none" opacity=".75" />
          <path d="M378 90a64 64 0 0 1 40-36" stroke="#fff" strokeOpacity=".35" strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>

        {/* moons */}
        <circle cx="318" cy="228" r="15" fill="#FFD166" />
        <circle cx="312" cy="222" r="4" fill="#D9A441" />
        <circle cx="262" cy="78" r="9" fill="#B8A5F5" />
      </g>

      {/* frame bolts */}
      {[[38, 36], [522, 36], [38, 340], [522, 340]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#3A447F" />
      ))}
      <text x="48" y="22" fill="#B9BFDC" fontSize="10" letterSpacing="2" fontFamily="ui-monospace, monospace">
        VIEWPORT 01
      </text>

      {/* cadets stand behind the console */}
      <Cadet suit={left} pose="point" x="52" y="238" width="112" height="158" />
      <Cadet suit={right} pose="wave" x="398" y="226" width="118" height="167" />
      <Cadet suit={suit} accessory={accessory} pose="idle" x="214" y="214" width="136" height="192" />

      {/* meeting console */}
      <rect x="20" y="382" width="520" height="104" rx="26" fill="#141A40" stroke="#3A447F" strokeWidth="4" />
      <rect x="40" y="392" width="480" height="14" rx="7" fill="url(#hazard)" opacity=".9" />
      <rect x="44" y="428" width="120" height="10" rx="5" fill="#2A3270" />
      <rect x="44" y="448" width="84" height="10" rx="5" fill="#2A3270" />
      <rect x="396" y="428" width="120" height="10" rx="5" fill="#2A3270" />
      <circle cx="412" cy="460" r="5" fill="#8DD982" />
      <circle cx="430" cy="460" r="5" fill="#FFD166" className="blink" />
      <circle cx="448" cy="460" r="5" fill="#F45858" />
    </svg>
  )
}
