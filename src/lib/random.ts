/** Fisher-Yates shuffle. Returns a new array. `rand` can be swapped for tests. */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function pick<T>(items: readonly T[], rand: () => number = Math.random): T {
  return items[Math.floor(rand() * items.length)]
}
