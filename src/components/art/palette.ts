/** Suit colors for the original "cadet" mascots. `main` is the suit, `shade` the darker limbs. */
export const suits = {
  red: { main: '#F45858', shade: '#C23C46' },
  orange: { main: '#F4936A', shade: '#C8704C' },
  yellow: { main: '#FFD166', shade: '#D9A441' },
  green: { main: '#8DD982', shade: '#5DAF5A' },
  cyan: { main: '#5FE3D0', shade: '#35B3A1' },
  blue: { main: '#67C9F5', shade: '#3E9BD0' },
  purple: { main: '#B8A5F5', shade: '#8A74D6' },
  pink: { main: '#FF9FD0', shade: '#D977A8' },
} as const

export type SuitName = keyof typeof suits

export const INK = '#070A1A'
