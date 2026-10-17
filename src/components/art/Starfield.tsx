import { useMemo, type CSSProperties } from 'react'

/** Deterministic pseudo-random numbers so the stars are identical on every render. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Fixed full-screen backdrop of twinkling stars, drawn once as SVG (no images needed). */
export function Starfield() {
  const stars = useMemo(() => {
    const rand = seeded(42)
    return Array.from({ length: 110 }, (_, i) => ({
      id: i,
      x: rand() * 1600,
      y: rand() * 900,
      r: 0.6 + rand() * 1.5,
      twinkle: i % 3 === 0,
      dur: 3 + rand() * 4,
      delay: rand() * 4,
    }))
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,#1a2160_0%,#0a0e2a_45%,#060818_80%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#FFE5D1"
            opacity={s.twinkle ? undefined : 0.55}
            className={s.twinkle ? 'star' : undefined}
            style={s.twinkle ? ({ '--dur': `${s.dur}s`, '--delay': `${s.delay}s` } as CSSProperties) : undefined}
          />
        ))}
      </svg>
    </div>
  )
}
