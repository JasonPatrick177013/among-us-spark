import { useEffect, useState } from 'react'

export type Countdown = { days: number; hours: number; minutes: number; seconds: number }

/**
 * Returns the time left until `iso`, or `null` when there is nothing honest to show:
 * no date configured, an invalid date, or a date that has already passed.
 */
export function useCountdown(iso: string | null): Countdown | null {
  const target = iso ? Date.parse(iso) : NaN
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (Number.isNaN(target)) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [target])

  if (Number.isNaN(target) || target <= now) return null

  const total = Math.floor((target - now) / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}
