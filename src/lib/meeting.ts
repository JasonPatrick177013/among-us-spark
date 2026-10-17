import { suits, type SuitName } from '../components/art/palette'
import { pick, shuffle } from './random'

export const ROOMS = ['Cafeteria', 'Electrical', 'Reactor', 'Medbay', 'Navigation'] as const
export type Room = (typeof ROOMS)[number]

export type Suspect = {
  suit: SuitName
  name: string
  /** Where the door sensors really saw them. */
  actual: Room
  /** Where they say they were. Honest crew match `actual`; the impostor does not. */
  claim: Room
  impostor: boolean
}

export type Round = { suspects: Suspect[]; bodyRoom: Room }

export const SUSPECT_COUNT = 5

const label = (suit: SuitName) => suit[0].toUpperCase() + suit.slice(1)

/**
 * Builds one case. Exactly one suspect (the impostor) has a claim that contradicts
 * the security log, so there is always a single correct answer.
 * The player's own suit is left out so you never vote against yourself.
 */
export function makeRound(player: SuitName, rand: () => number = Math.random): Round {
  const others = (Object.keys(suits) as SuitName[]).filter((s) => s !== player)
  const chosen = shuffle(others, rand).slice(0, SUSPECT_COUNT)
  const impostorIndex = Math.floor(rand() * chosen.length)

  const suspects = chosen.map((suit, i): Suspect => {
    const actual = pick(ROOMS, rand)
    const impostor = i === impostorIndex
    const claim = impostor ? pick(ROOMS.filter((r) => r !== actual), rand) : actual
    return { suit, name: label(suit), actual, claim, impostor }
  })

  return { suspects, bodyRoom: pick(ROOMS, rand) }
}

/** The security log: who the sensors saw in each room. */
export function logByRoom(suspects: Suspect[]): { room: Room; names: string[] }[] {
  return ROOMS.map((room) => ({ room, names: suspects.filter((s) => s.actual === room).map((s) => s.name) }))
}

/** True when what the suspect says does not match the log. */
export const contradictsLog = (s: Suspect) => s.claim !== s.actual
