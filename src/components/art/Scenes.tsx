import type { CSSProperties } from 'react'
import { Cadet } from './Cadet'
import { INK } from './palette'

/**
 * Original SVG scenes for the page. Everything here is drawn from simple shapes:
 * the ship, station and planets are made up for this site and are not Among Us assets.
 */

function seededStars(seed: number, count: number) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: count }, (_, i) => ({
    i,
    x: rand() * 800,
    y: rand() * 450,
    r: 0.8 + rand() * 1.6,
    o: 0.5 + rand() * 0.5,
    tw: i % 4 === 0,
    dur: 3 + rand() * 4,
    delay: rand() * 4,
  }))
}

/** Gradient sky plus a deterministic star layer. Must be rendered inside an <svg viewBox="0 0 800 450">. */
function Backdrop({ id, seed, from, to }: { id: string; seed: number; from: string; to: string }) {
  const stars = seededStars(seed, 70)
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#${id}-bg)`} />
      {stars.map((s) => (
        <circle
          key={s.i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#FFE5D1"
          opacity={s.tw ? undefined : s.o}
          className={s.tw ? 'star' : undefined}
          style={s.tw ? ({ '--dur': `${s.dur}s`, '--delay': `${s.delay}s` } as CSSProperties) : undefined}
        />
      ))}
    </>
  )
}

function PanelPattern({ id }: { id: string }) {
  return (
    <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#1d3a8a" />
      <path d="M0 0H16M0 0V16" stroke="#67C9F5" strokeOpacity=".5" strokeWidth="1" />
    </pattern>
  )
}

/* ---------------------------------------------------------------- */
/* Scene 1: the ship, in orbit, with a tethered cadet outside        */
/* ---------------------------------------------------------------- */

export function OrbitScene() {
  return (
    <svg viewBox="0 0 800 450" className="h-auto w-full" role="img" aria-label="Illustration: a small spaceship in orbit above a blue planet, with a cadet on a spacewalk tethered to the hull">
      <Backdrop id="orbit" seed={7} from="#0A0F33" to="#241466" />
      <defs>
        <radialGradient id="orbit-planet" cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#7be3ff" />
          <stop offset=".55" stopColor="#3E9BD0" />
          <stop offset="1" stopColor="#1b3a80" />
        </radialGradient>
        <linearGradient id="orbit-flame" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff4f63" stopOpacity="0" />
          <stop offset="1" stopColor="#FFD166" />
        </linearGradient>
        <clipPath id="orbit-planet-clip">
          <circle cx="650" cy="480" r="240" />
        </clipPath>
        <PanelPattern id="orbit-panel" />
      </defs>

      {/* planet */}
      <circle cx="650" cy="480" r="252" fill="none" stroke="#9BDDFB" strokeOpacity=".25" strokeWidth="12" />
      <circle cx="650" cy="480" r="240" fill="url(#orbit-planet)" />
      <g clipPath="url(#orbit-planet-clip)" fill="none" strokeLinecap="round">
        <path d="M400 330q150 -30 330 10" stroke="#fff" strokeOpacity=".2" strokeWidth="14" />
        <path d="M410 380q160 -24 340 14" stroke="#1b3a80" strokeOpacity=".55" strokeWidth="14" />
        <path d="M430 430q150 -16 330 16" stroke="#fff" strokeOpacity=".15" strokeWidth="12" />
      </g>

      {/* ship */}
      <g className="float" style={{ '--dur': '8s' } as CSSProperties}>
        <g transform="rotate(-6 320 225)" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          {/* engine flame */}
          <g className="blink" stroke="none">
            <polygon points="150,206 56,225 150,244" fill="url(#orbit-flame)" />
          </g>
          {/* solar panels */}
          <polygon points="270,170 300,118 430,118 400,170" fill="url(#orbit-panel)" stroke="#67C9F5" strokeWidth="2.5" />
          <polygon points="270,260 300,312 430,312 400,260" fill="url(#orbit-panel)" stroke="#67C9F5" strokeWidth="2.5" />
          <rect x="328" y="168" width="10" height="24" fill="#3A447F" />
          <rect x="328" y="258" width="10" height="14" fill="#3A447F" />
          {/* engine block and hull */}
          <rect x="136" y="198" width="52" height="54" rx="12" fill="#2A3270" />
          <rect x="170" y="190" width="300" height="70" rx="35" fill="#3A447F" />
          <rect x="196" y="199" width="250" height="13" rx="6.5" fill="#5560A8" stroke="none" opacity=".8" />
          {/* nose dome and cockpit */}
          <circle cx="468" cy="225" r="34" fill="#2A3270" />
          <ellipse cx="478" cy="222" rx="17" ry="13" fill="#0B1330" />
          <path d="M468 216q6-5 13-5" stroke="#9FD9FF" strokeWidth="3" fill="none" />
          {/* name band */}
          <rect x="250" y="226" width="130" height="22" rx="6" fill="#FFD166" />
          <text x="315" y="242" textAnchor="middle" fontSize="12" fontWeight="800" letterSpacing="3" fill={INK} stroke="none" fontFamily="ui-sans-serif, system-ui, sans-serif">
            MERIDIAN
          </text>
          {/* portholes */}
          {[204, 224, 244].map((x) => (
            <circle key={x} cx={x} cy="228" r="7" fill="#FFD166" />
          ))}
          <circle cx="400" cy="236" r="5" fill="#8DD982" />
          <circle cx="418" cy="236" r="5" fill="#F45858" className="blink" />
          {/* antenna */}
          <path d="M420 190L436 150" fill="none" />
          <circle cx="437" cy="147" r="5" fill="#FFD166" />
        </g>
      </g>

      {/* tether and spacewalking cadet */}
      <path d="M430 190C470 240 540 190 586 150" stroke="#FFE5D1" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" fill="none" />
      <g className="float" style={{ '--dur': '6s', '--delay': '0.6s' } as CSSProperties}>
        <Cadet suit="red" pose="wave" x={566} y={64} width={68} height={96} />
      </g>
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Scene 2: ringed planet with moons and a nebula                    */
/* ---------------------------------------------------------------- */

export function PlanetScene() {
  return (
    <svg viewBox="0 0 800 450" className="h-auto w-full" role="img" aria-label="Illustration: a ringed blue planet, a warm orange moon and a violet nebula glow">
      <Backdrop id="planet" seed={21} from="#0A0F33" to="#2a1670" />
      <defs>
        <radialGradient id="planet-nebula">
          <stop offset="0" stopColor="#b690ff" stopOpacity=".5" />
          <stop offset="1" stopColor="#b690ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="planet-body" cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#8be6ff" />
          <stop offset=".6" stopColor="#3fd2ff" />
          <stop offset="1" stopColor="#2a6fb0" />
        </radialGradient>
        <clipPath id="planet-clip">
          <circle cx="300" cy="235" r="110" />
        </clipPath>
      </defs>

      <ellipse cx="560" cy="130" rx="260" ry="160" fill="url(#planet-nebula)" />

      <g className="float" style={{ '--dur': '10s' } as CSSProperties}>
        <g transform="rotate(-18 300 235)">
          <ellipse cx="300" cy="235" rx="190" ry="44" fill="none" stroke="#9BDDFB" strokeOpacity=".5" strokeWidth="16" />
        </g>
        <circle cx="300" cy="235" r="110" fill="url(#planet-body)" />
        <g clipPath="url(#planet-clip)" fill="none" strokeLinecap="round">
          <path d="M180 200q120 30 240-6" stroke="#2a6fb0" strokeWidth="12" opacity=".6" />
          <path d="M175 245q125 28 250-4" stroke="#2a6fb0" strokeWidth="10" opacity=".5" />
          <path d="M190 290q110 22 220-2" stroke="#fff" strokeWidth="8" opacity=".25" />
        </g>
        <path d="M205 190a110 110 0 0 1 70-62" stroke="#fff" strokeOpacity=".4" strokeWidth="9" strokeLinecap="round" fill="none" />
        <g transform="rotate(-18 300 235)">
          <path d="M110 235A190 44 0 0 0 490 235" fill="none" stroke="#c6ecff" strokeWidth="16" />
        </g>
      </g>

      <g className="float" style={{ '--dur': '12s', '--delay': '1s' } as CSSProperties}>
        <circle cx="620" cy="140" r="52" fill="#F4936A" />
        <path d="M575 125q42 10 90-4M572 152q44 10 94-2" stroke="#D8704C" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".75" />
        <path d="M580 118a54 54 0 0 1 34-30" stroke="#fff" strokeOpacity=".35" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
      <circle cx="520" cy="360" r="16" fill="#FFD166" />
      <circle cx="514" cy="354" r="4" fill="#D9A441" />
      <circle cx="705" cy="320" r="9" fill="#b690ff" />
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Scene 3: an orbital station with solar wings and a blinking ring  */
/* ---------------------------------------------------------------- */

export function StationScene() {
  return (
    <svg viewBox="0 0 800 450" className="h-auto w-full" role="img" aria-label="Illustration: an orbital station with a ring, solar wings and blinking lights above a small orange planet">
      <Backdrop id="station" seed={33} from="#080b2c" to="#1a1560" />
      <defs>
        <PanelPattern id="station-panel" />
      </defs>

      {/* small planet in the corner */}
      <circle cx="110" cy="390" r="86" fill="#F4936A" />
      <path d="M40 360q70 14 140-6M32 395q78 14 156-4" stroke="#D8704C" strokeWidth="9" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M48 345a88 88 0 0 1 60-52" stroke="#fff" strokeOpacity=".3" strokeWidth="7" strokeLinecap="round" fill="none" />

      <g className="float" style={{ '--dur': '9s' } as CSSProperties}>
        <g stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          {/* booms and wings */}
          <rect x="296" y="218" width="64" height="14" fill="#3A447F" />
          <rect x="440" y="218" width="64" height="14" fill="#3A447F" />
          <rect x="160" y="196" width="140" height="58" rx="6" fill="url(#station-panel)" stroke="#67C9F5" strokeWidth="2.5" />
          <rect x="500" y="196" width="140" height="58" rx="6" fill="url(#station-panel)" stroke="#67C9F5" strokeWidth="2.5" />
          {/* spire */}
          <rect x="394" y="120" width="12" height="60" fill="#3A447F" />
          <circle cx="400" cy="116" r="6" fill="#F45858" className="blink" />
          {/* ring */}
          <ellipse cx="400" cy="225" rx="118" ry="32" fill="none" stroke="#2A3270" strokeWidth="16" />
          <ellipse cx="400" cy="225" rx="118" ry="32" fill="none" stroke="#67C9F5" strokeWidth="5" />
          {/* hub */}
          <circle cx="400" cy="225" r="48" fill="#3A447F" />
          <circle cx="400" cy="225" r="26" fill="#0B1330" />
          <path d="M386 216q6-8 17-9" stroke="#9FD9FF" strokeWidth="3" fill="none" />
          {/* docked pod */}
          <ellipse cx="400" cy="296" rx="26" ry="14" fill="#FFD166" />
          <rect x="394" y="272" width="12" height="16" fill="#3A447F" />
        </g>
        {[
          [290, 225, '#FFD166', 0],
          [330, 252, '#8DD982', 0.4],
          [470, 252, '#FFD166', 0.8],
          [510, 225, '#8DD982', 1.2],
          [470, 198, '#F45858', 1.6],
        ].map(([x, y, c, d]) => (
          <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="4.5" fill={c as string} className="blink" style={{ '--delay': `${d}s`, animationDelay: `${d}s` } as CSSProperties} />
        ))}
      </g>
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Scene 4: a debris field drifting past a small sun                 */
/* ---------------------------------------------------------------- */

export function DebrisScene() {
  return (
    <svg viewBox="0 0 800 450" className="h-auto w-full" role="img" aria-label="Illustration: rocky debris and a broken solar panel drifting past a glowing sun">
      <Backdrop id="debris" seed={55} from="#0A0F33" to="#31145e" />
      <defs>
        <radialGradient id="debris-sun">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset=".35" stopColor="#FFD166" stopOpacity=".85" />
          <stop offset="1" stopColor="#ff4f63" stopOpacity="0" />
        </radialGradient>
        <PanelPattern id="debris-panel" />
      </defs>

      <circle cx="660" cy="110" r="150" fill="url(#debris-sun)" />
      <circle cx="660" cy="110" r="34" fill="#FFF3C9" />

      <g className="float" style={{ '--dur': '11s' } as CSSProperties}>
        <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
          <polygon points="130,230 196,196 262,222 274,288 212,322 146,296" fill="#4B3F8F" />
          <polygon points="196,196 262,222 232,250 178,236" fill="#6757B8" stroke="none" />
          <circle cx="210" cy="276" r="12" fill="#3A2F78" />
          <circle cx="166" cy="262" r="7" fill="#3A2F78" />
        </g>
      </g>

      <g className="float" style={{ '--dur': '8s', '--delay': '1.2s' } as CSSProperties}>
        <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
          <polygon points="470,300 514,272 566,288 574,336 530,354 478,342" fill="#5A4AA6" />
          <polygon points="514,272 566,288 546,310 500,298" fill="#7a68cf" stroke="none" />
          <circle cx="528" cy="330" r="9" fill="#3A2F78" />
        </g>
      </g>

      <g className="float" style={{ '--dur': '13s', '--delay': '0.4s' } as CSSProperties}>
        <g transform="rotate(24 400 120)" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <polygon points="330,92 450,92 450,114 430,122 440,134 450,140 450,150 330,150" fill="url(#debris-panel)" stroke="#67C9F5" strokeWidth="2.5" />
          <path d="M330 121H300" fill="none" stroke="#3A447F" strokeWidth="8" />
        </g>
      </g>

      {[
        [350, 340, 14],
        [610, 230, 10],
        [90, 120, 9],
        [420, 50, 7],
        [720, 380, 12],
      ].map(([x, y, r]) => (
        <polygon
          key={`${x}-${y}`}
          points={`${x - r},${y} ${x - r / 3},${y - r} ${x + r},${y - r / 2} ${x + r / 2},${y + r} ${x - r / 2},${y + r}`}
          fill="#4B3F8F"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Deck map: top-down ship layout used by the scrolling tour         */
/* ---------------------------------------------------------------- */

export const deckRooms = [
  { id: 'mess', name: 'Mess Hall', cx: 260, cy: 75, x: 190, y: 30, w: 140, h: 90, tone: '#ffcb3d' },
  { id: 'bridge', name: 'Bridge', cx: 435, cy: 205, x: 380, y: 150, w: 110, h: 110, tone: '#3fd2ff' },
  { id: 'reactor', name: 'Reactor', cx: 260, cy: 345, x: 190, y: 300, w: 140, h: 90, tone: '#ff4f63' },
  { id: 'comms', name: 'Comms Deck', cx: 85, cy: 205, x: 30, y: 150, w: 110, h: 110, tone: '#6cf08a' },
] as const

export function DeckMap({ active, className = '' }: { active: number; className?: string }) {
  const here = deckRooms[active] ?? deckRooms[0]
  return (
    <svg viewBox="0 0 520 420" className={className} role="img" aria-label={`Ship deck map. The crew is in the ${here.name}.`}>
      {/* hull outline */}
      <rect x="14" y="10" width="492" height="400" rx="70" fill="none" stroke="#3b2f9a" strokeWidth="3" strokeDasharray="6 8" />

      {/* corridors and hub */}
      <g fill="#1b1052" stroke="#3b2f9a" strokeWidth="3">
        <rect x="248" y="116" width="24" height="54" />
        <rect x="298" y="198" width="86" height="24" />
        <rect x="248" y="250" width="24" height="54" />
        <rect x="136" y="198" width="88" height="24" />
        <circle cx="260" cy="210" r="44" />
      </g>
      <text x="260" y="214" textAnchor="middle" fontSize="10" letterSpacing="2" fill="#b9bfdc" fontFamily="ui-monospace, monospace">
        HUB
      </text>

      {/* rooms */}
      {deckRooms.map((room, i) => {
        const on = i === active
        return (
          <g key={room.id} style={{ filter: on ? `drop-shadow(0 0 10px ${room.tone})` : 'none', transition: 'filter 0.5s ease' }}>
            <rect x={room.x} y={room.y} width={room.w} height={room.h} rx="18" fill="#141A40" stroke={on ? room.tone : '#3b2f9a'} strokeWidth={on ? 4 : 3} style={{ transition: 'stroke 0.5s ease' }} />
            <rect x={room.x} y={room.y} width={room.w} height={room.h} rx="18" fill={room.tone} className="transition-opacity duration-500" style={{ opacity: on ? 0.16 : 0 }} />
            <text x={room.x + 12} y={room.y + 20} fontSize="11" letterSpacing="1.5" fill={on ? room.tone : '#b9bfdc'} fontFamily="ui-monospace, monospace">
              {room.name.toUpperCase()}
            </text>
          </g>
        )
      })}

      {/* room details */}
      <g stroke="#3A447F" strokeWidth="3">
        {/* mess hall tables */}
        <circle cx="228" cy="82" r="14" fill="#2A3270" />
        <circle cx="292" cy="82" r="14" fill="#2A3270" />
        {/* bridge console */}
        <rect x="402" y="176" width="66" height="10" rx="5" fill="#2A3270" />
        <rect x="412" y="232" width="46" height="10" rx="5" fill="#2A3270" />
        {/* reactor */}
        <circle cx="260" cy="352" r="24" fill="none" stroke="#ff4f63" strokeOpacity=".7" strokeWidth="5" />
        <circle cx="260" cy="352" r="9" fill="#ff4f63" stroke="none" opacity=".8" />
        {/* comms dish */}
        <path d="M62 218a24 24 0 0 1 48 0z" fill="#2A3270" />
        <path d="M86 218v14" fill="none" />
      </g>

      {/* the crewmate marker slides between rooms */}
      <g className="transition-transform duration-700 ease-in-out" style={{ transform: `translate(${here.cx}px, ${here.cy + 8}px)` }}>
        <Cadet suit="red" pose="point" x={-20} y={-56} width={40} height={57} />
      </g>
    </svg>
  )
}
