import { useEffect, useMemo, useRef, type CSSProperties } from 'react'

const W = 1600
const H = 900

/**
 * Three depth layers. `mouse` is how far (in drawing units) a layer slides against the cursor,
 * `scroll` is how fast it streams upward as the page scrolls. Near stars move most, far stars least,
 * which is what makes the backdrop feel like real depth.
 */
const LAYERS = [
  { count: 70, rMin: 0.5, rMax: 1.0, opacity: 0.5, mouse: 10, scroll: 0.02, twinkle: 0.2, tint: ['#FFE5D1'] },
  { count: 42, rMin: 0.8, rMax: 1.6, opacity: 0.8, mouse: 26, scroll: 0.05, twinkle: 0.35, tint: ['#FFE5D1', '#B8A5F5'] },
  { count: 20, rMin: 1.5, rMax: 2.6, opacity: 1, mouse: 56, scroll: 0.11, twinkle: 0.5, tint: ['#FFE5D1', '#67C9F5', '#FFD166'] },
]

/** Deterministic pseudo-random numbers so the stars are identical on every render. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const SHOOTING = [
  { top: '12%', left: '62%', delay: '3s', dur: '9s' },
  { top: '30%', left: '88%', delay: '11s', dur: '13s' },
  { top: '8%', left: '28%', delay: '19s', dur: '17s' },
]

/**
 * Fixed backdrop: soft nebula clouds plus three star layers that slide with the cursor and stream
 * past as you scroll (each layer tiles vertically, so the loop never shows a seam), and a few
 * shooting stars. With reduced motion the sky is a still picture.
 */
export function Starfield() {
  const layerRefs = useRef<(SVGGElement | null)[]>([])
  const nebulaRef = useRef<HTMLDivElement>(null)

  const layers = useMemo(
    () =>
      LAYERS.map((layer, li) => {
        const rand = seeded(42 + li * 97)
        const stars = Array.from({ length: layer.count }, (_, i) => ({
          id: i,
          x: -120 + rand() * (W + 240),
          y: rand() * H,
          r: layer.rMin + rand() * (layer.rMax - layer.rMin),
          color: layer.tint[Math.floor(rand() * layer.tint.length)],
          twinkle: rand() < layer.twinkle,
          dur: 3 + rand() * 4,
          delay: rand() * 4,
        }))
        return { ...layer, stars }
      }),
    [],
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let frame = 0

    const apply = () => {
      const sy = window.scrollY
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i]
        if (!el) return
        const up = -((sy * layer.scroll) % H)
        el.style.transform = `translate(${(-cx * layer.mouse).toFixed(2)}px, ${(-cy * layer.mouse + up).toFixed(2)}px)`
      })
      if (nebulaRef.current) nebulaRef.current.style.transform = `translate(${(-cx * 18).toFixed(2)}px, ${(-cy * 18).toFixed(2)}px)`
    }

    const tick = () => {
      frame = 0
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      apply()
      // Keep easing until the sky has caught up with the cursor.
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) frame = requestAnimationFrame(tick)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
      schedule()
    }

    apply()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,#1a2160_0%,#0a0e2a_45%,#060818_80%)]" />

      {/* nebula clouds: oversized so they can drift without showing an edge */}
      <div ref={nebulaRef} className="absolute -inset-16 will-change-transform">
        <div className="absolute left-[8%] top-[18%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgb(184_165_245/0.16),transparent_65%)]" />
        <div className="absolute bottom-[4%] right-[6%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgb(244_88_88/0.13),transparent_65%)]" />
        <div className="absolute left-[44%] top-[52%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgb(103_201_245/0.1),transparent_65%)]" />
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        {layers.map((layer, li) => (
          <g
            key={li}
            ref={(el) => {
              layerRefs.current[li] = el
            }}
            opacity={layer.opacity}
          >
            {/* drawn twice, one tile apart, so the vertical scroll loop is seamless */}
            {[0, H].map((offset) =>
              layer.stars.map((s) => (
                <circle
                  key={`${offset}-${s.id}`}
                  cx={s.x}
                  cy={s.y + offset}
                  r={s.r}
                  fill={s.color}
                  opacity={s.twinkle ? undefined : 0.7}
                  className={s.twinkle ? 'star' : undefined}
                  style={s.twinkle ? ({ '--dur': `${s.dur}s`, '--delay': `${s.delay}s` } as CSSProperties) : undefined}
                />
              )),
            )}
          </g>
        ))}
      </svg>

      {SHOOTING.map((s, i) => (
        <span key={i} className="shooting-star" style={{ top: s.top, left: s.left, '--delay': s.delay, '--dur': s.dur } as CSSProperties} />
      ))}
    </div>
  )
}
