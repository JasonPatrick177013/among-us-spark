import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { SuitName } from '../components/art/palette'
import { suits } from '../components/art/palette'
import { accessoryOptions, type Accessory } from '../config/crew'

type Stored = { suit: SuitName; accessory: Accessory; unlocked: boolean }
const KEY = 'impostor-protocol-crew'
const DEFAULTS: Stored = { suit: 'red', accessory: 'antenna', unlocked: false }

/** Reads the saved crewmate. Never trusts the stored value: anything unexpected falls back to defaults. */
function load(): Stored {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Stored> | null
    if (!raw) return DEFAULTS
    const suit = raw.suit && raw.suit in suits ? raw.suit : DEFAULTS.suit
    const unlocked = raw.unlocked === true
    const known = accessoryOptions.find((a) => a.id === raw.accessory)
    const accessory = known && (!known.locked || unlocked) ? known.id : DEFAULTS.accessory
    return { suit, accessory, unlocked }
  } catch {
    return DEFAULTS
  }
}

function save(value: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable (private window): the crewmate just won't be remembered */
  }
}

type CrewValue = {
  suit: SuitName
  accessory: Accessory
  /** True once both command-deck tasks are done: unlocks the golden crown. */
  unlocked: boolean
  setSuit: (suit: SuitName) => void
  setAccessory: (accessory: Accessory) => void
  unlock: () => void
}

const CrewContext = createContext<CrewValue | null>(null)

/** Holds the visitor's crewmate (suit + gear) so the hero, rail, lab and sign-up all match. */
export function CrewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(load)

  const update = useCallback((patch: Partial<Stored>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      save(next)
      return next
    })
  }, [])

  const value = useMemo<CrewValue>(
    () => ({
      ...state,
      setSuit: (suit) => update({ suit }),
      setAccessory: (accessory) => update({ accessory }),
      unlock: () => update({ unlocked: true }),
    }),
    [state, update],
  )

  return <CrewContext.Provider value={value}>{children}</CrewContext.Provider>
}

export function useCrew(): CrewValue {
  const ctx = useContext(CrewContext)
  if (!ctx) throw new Error('useCrew must be used inside <CrewProvider>')
  return ctx
}
