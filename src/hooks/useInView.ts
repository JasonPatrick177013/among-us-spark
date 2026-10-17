import { useEffect, useRef, useState } from 'react'

/** Returns a ref and a flag that flips to true (once) the first time the element scrolls into view. */
export function useInView<T extends HTMLElement>(threshold = 0.5) {
  const ref = useRef<T>(null)
  // Old browsers without IntersectionObserver just show the final state.
  const [seen, setSeen] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window))

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, seen] as const
}
