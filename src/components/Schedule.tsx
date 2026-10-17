import { useEffect, useRef, useState } from 'react'
import { eventConfig } from '../config/event'
import { SectionHeading } from './ui/SectionHeading'

/**
 * The evening as a timeline. A glowing line fills as you scroll, and each stop
 * lights up when it passes the reading line (about 60% down the screen).
 */
export function Schedule() {
  const items = eventConfig.schedule
  const listRef = useRef<HTMLOListElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [reached, setReached] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const list = listRef.current
      const fill = fillRef.current
      if (!list || !fill) return
      const line = window.innerHeight * 0.6
      const rect = list.getBoundingClientRect()
      const filled = Math.min(Math.max(line - rect.top, 0), rect.height)
      fill.style.height = `${filled}px`
      let count = 0
      itemRefs.current.forEach((el) => {
        if (el && el.getBoundingClientRect().top < line) count += 1
      })
      setReached(count)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id="schedule-title"
              kicker="Flight plan"
              title="Your evening, minute by minute"
              intro="Eight stops from doors opening to the awards. Scroll down the line to follow along. All times are in IST."
              accent="lime"
            />
            <p className="readout text-lime" aria-hidden="true">
              Stop {Math.max(reached, 1)} of {items.length}
            </p>
          </div>
        </div>

        <ol ref={listRef} className="relative lg:col-span-3 pl-10">
          {/* the track, and the part of it that has been flown */}
          <div className="absolute bottom-2 left-[11px] top-2 w-[3px] rounded bg-line" aria-hidden="true">
            <div ref={fillRef} className="w-full rounded bg-gradient-to-b from-lime to-sky shadow-[0_0_12px_rgb(108_240_138/0.7)] transition-[height] duration-150" style={{ height: 0 }} />
          </div>

          {items.map((item, i) => {
            const on = i < reached
            return (
              <li
                key={item.time}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className="relative pb-10 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-9 top-1.5 h-4 w-4 rounded-full border-[3px] transition-colors duration-300 ${
                    on ? 'border-lime bg-lime shadow-[0_0_12px_rgb(108_240_138/0.8)]' : 'border-line bg-void'
                  }`}
                />
                <div className={`panel p-5 transition-opacity duration-300 md:p-6 ${on ? '' : 'opacity-70'}`}>
                  <p className={`readout ${on ? 'text-lime' : 'text-mute'}`}>{item.time}</p>
                  <h3 className="mt-1 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-mute">{item.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
