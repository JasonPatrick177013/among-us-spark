import type { SuitName } from '../components/art/palette'

export type Accessory = 'antenna' | 'sprout' | 'party' | 'halo' | 'crown'

export const suitOrder: SuitName[] = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink']

export const accessoryOptions: { id: Accessory; label: string; locked?: boolean }[] = [
  { id: 'antenna', label: 'Antenna' },
  { id: 'sprout', label: 'Sprout' },
  { id: 'party', label: 'Party hat' },
  { id: 'halo', label: 'Halo' },
  { id: 'crown', label: 'Golden crown', locked: true }, // unlocked by finishing both command-deck tasks
]
