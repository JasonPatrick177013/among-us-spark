import { useEffect, useRef, useState } from 'react'
import { Award, Lightbulb, LightbulbOff, RotateCcw, ShieldAlert, UserX } from 'lucide-react'
import { useCrew } from '../../context/CrewContext'
import { logByRoom, makeRound, type Round } from '../../lib/meeting'
import { Cadet } from '../art/Cadet'
import { suits } from '../art/palette'

const MAX_EJECTIONS = 2
const BLACKOUT_MS = 8000
const REPAIR_MS = 1200
const BRIEFING = 'Read the security log, compare it with what each crewmate says, then vote out the liar.'

type Phase = 'meeting' | 'ejecting' | 'over'

/**
 * Hold-to-repair button. Pointer: press and hold. Keyboard: hold Space or Enter.
 * Releasing early resets the progress, so you have to commit to the repair.
 */
function RepairButton({ onRepaired }: { onRepaired: () => void }) {
  const [progress, setProgress] = useState(0)
  const timer = useRef<number | null>(null)
  const startedAt = useRef(0)

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
    setProgress(0)
  }
  const start = () => {
    if (timer.current !== null) return
    startedAt.current = Date.now()
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt.current) / REPAIR_MS)
      setProgress(p)
      if (p >= 1) {
        stop()
        onRepaired()
      }
    }, 40)
  }
  useEffect(() => () => {
    if (timer.current !== null) window.clearInterval(timer.current)
  }, [])

  return (
    <button
      type="button"
      className="btn btn-ghost relative overflow-hidden !border-gold"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onBlur={stop}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault()
          start()
        }
      }}
      onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && stop()}
    >
      <span className="absolute inset-y-0 left-0 bg-gold/35" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
      <Lightbulb size={18} aria-hidden="true" className="relative" />
      <span className="relative">Hold to restore power</span>
    </button>
  )
}

export function MeetingGame({ onComplete }: { onComplete: () => void }) {
  const { suit: playerSuit, accessory } = useCrew()
  const [round, setRound] = useState<Round>(() => makeRound(playerSuit))
  const [phase, setPhase] = useState<Phase>('meeting')
  const [ejected, setEjected] = useState<string[]>([])
  const [vote, setVote] = useState<string | null>(null)
  const [ejecting, setEjecting] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [votedInDark, setVotedInDark] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState(BRIEFING)

  const suspects = round.suspects
  const livesLeft = MAX_EJECTIONS - ejected.length
  const impostor = suspects.find((s) => s.impostor)!

  // Sabotage lasts a few seconds on its own, or until it is repaired.
  useEffect(() => {
    if (!dark) return
    const t = window.setTimeout(() => setDark(false), BLACKOUT_MS)
    return () => window.clearTimeout(t)
  }, [dark])

  // The ejection animation, then the reveal.
  useEffect(() => {
    if (phase !== 'ejecting' || !ejecting) return
    const t = window.setTimeout(() => {
      const target = suspects.find((s) => s.suit === ejecting)!
      setEjecting(null)
      setVote(null)
      if (target.impostor) {
        setPhase('over')
        setWon(true)
        setMessage(`${target.name} was the Impostor. The crew wins.`)
        onComplete()
      } else if (ejected.length + 1 >= MAX_EJECTIONS) {
        setEjected((e) => [...e, target.suit])
        setPhase('over')
        setMessage(`${target.name} was not the Impostor. The crew is out of votes, and ${impostor.name} wins.`)
      } else {
        setEjected((e) => [...e, target.suit])
        setPhase('meeting')
        setMessage(`${target.name} was not the Impostor. One more vote, so choose carefully.`)
      }
    }, 2300)
    return () => window.clearTimeout(t)
    // `ejected` is read when the timer fires; the effect only needs to restart for a new ejection.
  }, [phase, ejecting])

  const eject = () => {
    if (!vote || phase !== 'meeting') return
    if (dark) setVotedInDark(true)
    const target = suspects.find((s) => s.suit === vote)!
    setEjecting(vote)
    setPhase('ejecting')
    setMessage(`${target.name} is being ejected…`)
  }

  const reset = () => {
    setRound(makeRound(playerSuit))
    setPhase('meeting')
    setEjected([])
    setVote(null)
    setEjecting(null)
    setDark(false)
    setVotedInDark(false)
    setWon(false)
    setMessage(BRIEFING)
  }

  const log = logByRoom(suspects)
  const over = phase === 'over'

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-5">
        {/* security log */}
        <div className={`panel relative p-5 lg:col-span-2 ${dark ? 'alarm' : ''}`}>
          <p className="readout mb-1 flex items-center gap-2 text-sky">
            <ShieldAlert size={16} aria-hidden="true" /> Security log
          </p>
          <p className="mb-4 text-sm text-mute">A body was reported in the {round.bodyRoom}. Door sensors saw:</p>
          {dark ? (
            <div role="status" className="grid min-h-[13rem] place-items-center rounded-xl bg-void/80 p-4 text-center">
              <div>
                <LightbulbOff size={30} className="mx-auto text-sus" aria-hidden="true" />
                <p className="mt-2 font-display font-semibold text-sus">Sabotage. Cameras offline.</p>
                <p className="mt-1 text-sm text-mute">Restore power, or wait it out.</p>
              </div>
            </div>
          ) : (
            <ul className="grid gap-2">
              {log.map(({ room, names }) => (
                <li key={room} className="flex items-baseline justify-between gap-3 rounded-xl bg-void/70 px-4 py-2.5">
                  <span className="font-display font-semibold">{room}</span>
                  <span className="text-right text-sm text-mute">{names.length ? names.join(', ') : 'nobody'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* the crew */}
        <fieldset disabled={over || phase === 'ejecting'} className="lg:col-span-3">
          <legend className="readout mb-3 text-gold">Vote to eject ({livesLeft} {livesLeft === 1 ? 'vote' : 'votes'} left)</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {suspects.map((s) => {
              const gone = ejected.includes(s.suit) || (over && won && s.impostor)
              const flying = ejecting === s.suit
              const chosen = vote === s.suit
              return (
                <label key={s.suit} className={`relative block ${gone ? 'opacity-35 grayscale' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name="meeting-vote"
                    value={s.suit}
                    checked={chosen}
                    disabled={gone}
                    onChange={() => setVote(s.suit)}
                    className="peer sr-only"
                  />
                  <span
                    className={`block h-full rounded-2xl border-2 bg-hull p-3 text-center transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold ${
                      chosen ? 'border-sus bg-panel' : 'border-line hover:border-mute'
                    }`}
                  >
                    <span className={`block ${flying ? 'eject' : ''}`}>
                      <Cadet suit={s.suit} pose={chosen ? 'point' : 'idle'} className="mx-auto h-24 w-auto" />
                    </span>
                    <span className="mt-1 block font-display font-semibold" style={{ color: suits[s.suit].main }}>
                      {s.name}
                    </span>
                    <span className="mt-1 block text-sm text-mute">
                      {gone ? 'Ejected.' : `“I was in ${s.claim}.”`}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary" onClick={eject} disabled={!vote || phase !== 'meeting'}>
              <UserX size={18} aria-hidden="true" /> Eject {vote ? suspects.find((s) => s.suit === vote)!.name : 'a crewmate'}
            </button>
            {!over && !dark && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={phase !== 'meeting'}
                onClick={() => {
                  setDark(true)
                  setMessage('Sabotage! The cameras are down. Vote now for a hard-mode badge, or restore power.')
                }}
              >
                <LightbulbOff size={18} aria-hidden="true" /> Sabotage lights
              </button>
            )}
            {!over && dark && <RepairButton onRepaired={() => { setDark(false); setMessage('Power restored. The security log is back.') }} />}
          </div>
        </fieldset>
      </div>

      <p role="status" aria-live="polite" className="mt-5 min-h-[3.5rem] text-lg text-mute">
        {message}
      </p>

      {over && (
        <div className={`mb-2 flex flex-wrap items-center gap-4 rounded-2xl border-2 bg-panel p-4 ${won ? 'border-lime' : 'border-sus'}`}>
          <Cadet suit={won ? playerSuit : impostor.suit} accessory={won ? accessory : 'antenna'} pose={won ? 'cheer' : 'point'} className="h-20 w-auto shrink-0" />
          <div className="min-w-0 flex-1 text-cream">
            <p className="font-display text-xl font-bold">{won ? 'Crew victory' : 'Impostor victory'}</p>
            <p className="text-mute">
              {won
                ? 'You matched every claim against the log and found the liar.'
                : `${impostor.name} said they were in the ${impostor.claim}, but the sensors saw them in the ${impostor.actual}.`}
            </p>
            {won && votedInDark && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold px-3 py-1 text-sm text-gold">
                <Award size={16} aria-hidden="true" /> Hard mode: you cast the winning vote with the cameras down.
              </p>
            )}
          </div>
        </div>
      )}

      <button type="button" className="btn btn-ghost mt-3" onClick={reset}>
        <RotateCcw size={18} aria-hidden="true" /> {over ? 'New case' : 'Reshuffle the crew'}
      </button>
    </div>
  )
}
