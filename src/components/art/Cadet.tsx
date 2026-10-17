import type { SVGProps } from 'react'
import { INK, suits, type SuitName } from './palette'

export type CadetPose = 'idle' | 'wave' | 'point' | 'cheer'

type CadetProps = SVGProps<SVGSVGElement> & {
  suit?: SuitName
  pose?: CadetPose
}

/**
 * An ORIGINAL astronaut mascot ("cadet"): round dome helmet, antenna, chest panel.
 * It is not an official Among Us asset. Because it is an <svg>, it can be used on
 * its own in the page OR nested inside a bigger <svg> scene (x / y / width / height work).
 */
export function Cadet({ suit = 'red', pose = 'idle', ...svgProps }: CadetProps) {
  const { main, shade } = suits[suit]

  // Each arm is a rounded bar rotated around its shoulder. 0deg = hanging down.
  const arms: Record<CadetPose, { left: number; right: number }> = {
    idle: { left: 8, right: -8 },
    wave: { left: 8, right: -150 },
    point: { left: 8, right: -105 },
    cheer: { left: 150, right: -150 },
  }
  const { left, right } = arms[pose]

  return (
    <svg viewBox="0 0 120 170" aria-hidden="true" focusable="false" {...svgProps}>
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        {/* antenna */}
        <path d="M60 18V8" fill="none" />
        <circle cx="60" cy="7" r="4.5" fill="#FFD166" />
        {/* boots */}
        <rect x="37" y="132" width="20" height="28" rx="9" fill={shade} />
        <rect x="63" y="132" width="20" height="28" rx="9" fill={shade} />
        {/* arms sit behind the body */}
        <rect x="20" y="90" width="16" height="38" rx="8" fill={shade} transform={`rotate(${left} 28 94)`} />
        <rect x="84" y="90" width="16" height="38" rx="8" fill={shade} transform={`rotate(${right} 92 94)`} />
        {/* torso */}
        <rect x="30" y="78" width="60" height="62" rx="20" fill={main} />
        {/* helmet */}
        <circle cx="60" cy="50" r="34" fill={main} />
        {/* visor */}
        <ellipse cx="60" cy="52" rx="25" ry="19" fill="#0B1330" />
      </g>
      {/* visor glints */}
      <path d="M43 46q6-9 16-10" stroke="#9FD9FF" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="75" cy="60" r="2" fill="#fff" opacity=".8" />
      <circle cx="68" cy="45" r="1.4" fill="#fff" opacity=".6" />
      {/* helmet shine */}
      <path d="M33 38a30 30 0 0 1 13-13" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* chest panel */}
      <rect x="44" y="94" width="32" height="18" rx="6" fill="#0B1330" />
      <circle cx="53" cy="103" r="2.8" fill="#FFD166" />
      <circle cx="62" cy="103" r="2.8" fill="#8DD982" />
      <rect x="68" y="101" width="4" height="4" rx="1" fill="#F45858" />
    </svg>
  )
}
