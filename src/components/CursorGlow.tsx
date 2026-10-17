import { useEffect, useRef } from 'react'

/**
 * A soft neon ring that trails the mouse and grows over links and buttons. Only for devices
 * with a real pointer, and switched off for reduced-motion users. The cursor itself is set in CSS.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || calm) return

    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let big = false
    let frame = 0

    const draw = () => {
      x += (tx - x) * 0.2
      y += (ty - y) * 0.2
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${big ? 1.7 : 1})`
      // Keep animating until the ring has caught up with the pointer.
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(draw) : 0
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (el.style.opacity !== '1') {
        x = e.clientX
        y = e.clientY
        el.style.opacity = '1'
      }
      tx = e.clientX
      ty = e.clientY
      big = e.target instanceof Element && e.target.closest('a, button, [role="tab"], summary') !== null
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const onLeave = () => {
      el.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="cursor-glow" />
}
