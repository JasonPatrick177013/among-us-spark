import { useState } from 'react'
import { Lock, RotateCcw, Shuffle } from 'lucide-react'
import { accessoryOptions, suitOrder } from '../config/crew'
import { useCrew } from '../context/CrewContext'
import { pick } from '../lib/random'
import { Cadet, type CadetPose } from './art/Cadet'
import { suits } from './art/palette'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'

const poses: { id: CadetPose; label: string }[] = [
  { id: 'idle', label: 'Idle' },
  { id: 'wave', label: 'Wave' },
  { id: 'point', label: 'Accuse' },
  { id: 'cheer', label: 'Cheer' },
]

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

/**
 * Crew lab: pick your suit colour and gear. The choice is saved in the browser and used across
 * the page (hero, scroll rail, sign-up), so the site is visibly "yours".
 */
export function CrewLab() {
  const { suit, accessory, unlocked, setSuit, setAccessory } = useCrew()
  const [pose, setPose] = useState<CadetPose>('wave')

  const gear = accessoryOptions.find((a) => a.id === accessory)!
  const callsign = accessory === 'antenna' ? `${cap(suit)} Cadet` : `${cap(suit)} ${gear.label}`
  const freeGear = accessoryOptions.filter((a) => !a.locked)

  const randomise = () => {
    setSuit(pick(suitOrder))
    setAccessory(pick(unlocked ? accessoryOptions : freeGear).id)
    setPose(pick(poses).id)
  }
  const reset = () => {
    setSuit('red')
    setAccessory('antenna')
    setPose('wave')
  }

  const chip =
    'cursor-pointer rounded-xl border-2 px-4 py-2 font-display text-sm font-semibold transition-colors peer-checked:border-cream peer-checked:bg-panel peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold'

  return (
    <section id="lab" aria-labelledby="lab-title" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        id="lab-title"
        kicker="Crew lab"
        title="Suit up"
        intro="Choose your colour and gear. Your crewmate follows you down the page: it flies in the hero, rides the scroll rail and waits at the sign-up."
        accent="violet"
      />

      <Reveal>
        <div className="grid items-stretch gap-6 lg:grid-cols-5">
          {/* the stage */}
          <div className="panel relative overflow-hidden p-6 lg:col-span-2">
            <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_0%,rgb(184_165_245/0.28),transparent_70%)]" aria-hidden="true" />
            <svg viewBox="0 0 300 40" className="absolute inset-x-6 bottom-[7.4rem] w-[calc(100%-3rem)]" aria-hidden="true">
              <ellipse cx="150" cy="20" rx="130" ry="14" fill="#141A40" stroke="#2A3270" strokeWidth="3" />
              <ellipse cx="150" cy="17" rx="96" ry="8" fill="none" stroke={suits[suit].main} strokeOpacity=".6" strokeWidth="2" strokeDasharray="4 7" />
            </svg>
            <div className="relative flex h-72 items-end justify-center pb-2">
              <Cadet key={`${suit}-${accessory}-${pose}`} suit={suit} accessory={accessory} pose={pose} className="cadet-pop h-64 w-auto drop-shadow-[0_14px_14px_rgb(0_0_0/0.45)]" />
            </div>

            {/* crew ID */}
            <div className="relative mt-4 flex items-center gap-4 rounded-2xl border-2 border-line bg-void/80 p-4">
              <span className="h-12 w-3 shrink-0 rounded-full" style={{ background: suits[suit].main }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="readout text-mute">Crew ID</p>
                <p className="truncate font-display text-xl font-bold">{callsign}</p>
                <p className="text-sm text-mute">Cleared for boarding</p>
              </div>
            </div>
          </div>

          {/* the controls */}
          <div className="panel flex flex-col gap-7 p-6 sm:p-8 lg:col-span-3">
            <fieldset>
              <legend className="readout mb-3 text-gold">Suit colour</legend>
              <div className="flex flex-wrap gap-3">
                {suitOrder.map((name) => (
                  <label key={name} className="cursor-pointer">
                    <input type="radio" name="lab-suit" value={name} checked={suit === name} onChange={() => setSuit(name)} className="peer sr-only" />
                    <span
                      className="block h-12 w-12 rounded-full border-4 border-void shadow-[0_0_0_2px_var(--color-line)] transition-transform hover:scale-110 peer-checked:scale-110 peer-checked:shadow-[0_0_0_4px_var(--color-cream)] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-4 peer-focus-visible:outline-gold"
                      style={{ background: suits[name].main }}
                    >
                      <span className="sr-only">{cap(name)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="readout mb-3 text-gold">Gear</legend>
              <div className="flex flex-wrap gap-3">
                {accessoryOptions.map((opt) => {
                  const locked = opt.locked && !unlocked
                  return (
                    <label key={opt.id} className={locked ? 'cursor-not-allowed' : ''}>
                      <input
                        type="radio"
                        name="lab-gear"
                        value={opt.id}
                        checked={accessory === opt.id}
                        disabled={locked}
                        onChange={() => setAccessory(opt.id)}
                        className="peer sr-only"
                      />
                      <span className={`${chip} inline-flex items-center gap-2 ${locked ? 'border-dashed border-line text-mute' : 'border-line hover:border-mute'}`}>
                        {locked && <Lock size={14} aria-hidden="true" />}
                        {opt.label}
                      </span>
                    </label>
                  )
                })}
              </div>
              {!unlocked && (
                <p className="mt-3 text-sm text-mute">
                  The golden crown unlocks when you finish both tasks in the{' '}
                  <a href="#command-deck" className="text-gold underline underline-offset-4">
                    command deck
                  </a>
                  .
                </p>
              )}
              {unlocked && <p className="mt-3 text-sm text-gold">Golden crown unlocked. Well earned.</p>}
            </fieldset>

            <fieldset>
              <legend className="readout mb-3 text-gold">Pose</legend>
              <div className="flex flex-wrap gap-3">
                {poses.map((p) => (
                  <label key={p.id}>
                    <input type="radio" name="lab-pose" value={p.id} checked={pose === p.id} onChange={() => setPose(p.id)} className="peer sr-only" />
                    <span className={`${chip} inline-block border-line hover:border-mute`}>{p.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-auto flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={randomise}>
                <Shuffle size={18} aria-hidden="true" /> Surprise me
              </button>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                <RotateCcw size={18} aria-hidden="true" /> Reset
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
