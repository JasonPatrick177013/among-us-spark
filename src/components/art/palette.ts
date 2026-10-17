/** Suit colors for the original "cadet" mascots. `main` is the suit, `shade` the darker limbs. */
export const suits = {
  red: { main: '#F45858', shade: '#C23C46' },
  yellow: { main: '#FFD166', shade: '#D9A441' },
  green: { main: '#8DD982', shade: '#5DAF5A' },
  blue: { main: '#67C9F5', shade: '#3E9BD0' },
  purple: { main: '#B8A5F5', shade: '#8A74D6' },
} as const

export type SuitName = keyof typeof suits

export const INK = '#070A1A'
