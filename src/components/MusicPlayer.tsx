import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { ChevronDown, Pause, Play, Radio, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useRadio } from '../audio/radio'
import type { TrackAccent } from '../config/music'

/** Static class names per accent so Tailwind can see them. */
const accentText: Record<TrackAccent, string> = {
  gold: 'text-gold',
  sky: 'text-sky',
  violet: 'text-violet',
  sus: 'text-sus',
  lime: 'text-lime',
}
const accentBorder: Record<TrackAccent, string> = {
  gold: 'border-gold/70',
  sky: 'border-sky/70',
  violet: 'border-violet/70',
  sus: 'border-sus/70',
  lime: 'border-lime/70',
}

/** Little animated equaliser. Bars sit still when `active` is false (and for reduced motion). */
function Equalizer({ active, bars = 4, className = '' }: { active: boolean; bars?: number; className?: string }) {
  return (
    <span className={`eq ${active ? 'is-active' : ''} ${className}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className="eq-bar" style={{ '--i': i } as CSSProperties} />
      ))}
    </span>
  )
}

export function MusicPlayer() {
  const { playing, index, volume, track, tracks, radio } = useRadio()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  // Close on Escape or when clicking/tapping anywhere outside the player
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])
  // Start the radio on the visitor's first click, tap or key press.
// (Browsers block sound until then, so this is as "automatic" as it can get.)
useEffect(() => {
  if (radio.getState().playing) return
  const start = (e: Event) => {
    // If their first click is on the radio itself, let that button do its job
    if ((e.target as HTMLElement | null)?.closest('[data-radio]')) return
    radio.play()
    cleanup()
  }
  const cleanup = () => {
    window.removeEventListener('pointerup', start)
    window.removeEventListener('keydown', start)
  }
  window.addEventListener('pointerup', start)
  window.addEventListener('keydown', start)
  return cleanup
}, [radio])

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.45 ? Volume1 : Volume2

  return (
    <div ref={rootRef} className="relative">
      {/* The bar control: a split pill. Left half is the on/off switch, right half opens the panel. */}
      <div
        className={`flex h-11 items-stretch overflow-hidden rounded-full border-2 transition-colors ${
          playing ? 'border-lime/70 shadow-[0_0_18px_-4px_var(--color-lime)]' : 'border-line'
        } bg-panel/70`}
      >
        <button
          type="button"
          onClick={radio.toggle}
          aria-pressed={playing}
          aria-label={playing ? 'Turn music off' : 'Turn music on'}
          title={playing ? 'Music on. Click to turn off' : 'Music off. Click to turn on'}
          className={`grid w-11 place-items-center transition-colors hover:bg-line/50 ${playing ? 'text-lime' : 'text-cream'}`}
        >
          {playing ? <Pause size={18} aria-hidden="true" fill="currentColor" /> : <Play size={18} aria-hidden="true" fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Ship radio: ${track.title}. ${open ? 'Close' : 'Open'} music panel`}
          className="flex items-center gap-2 border-l border-line/80 pl-2.5 pr-2.5 transition-colors hover:bg-line/50 sm:pl-3"
        >
          <Equalizer active={playing} className="hidden h-4 sm:inline-flex" />
          <span className="readout hidden max-w-[8.5rem] truncate !text-[0.68rem] text-cream xl:block">{track.title}</span>
          <ChevronDown size={14} aria-hidden="true" className={`text-mute transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Ship radio"
          className="panel radio-pop fixed inset-x-3 top-[4.25rem] z-50 p-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[24rem]"
        >
          {/* Header strip */}
          <div className="flex items-center justify-between border-b-2 border-line bg-void/60 px-4 py-2.5">
            <span className="readout flex items-center gap-2 text-sky">
              <Radio size={14} aria-hidden="true" /> Ship radio
            </span>
            <span className={`readout flex items-center gap-2 ${playing ? 'text-lime' : 'text-mute'}`}>
              <span className={`h-2 w-2 rounded-full ${playing ? 'bg-lime blink' : 'bg-mute/60'}`} aria-hidden="true" />
              {playing ? 'On air' : 'Standby'}
            </span>
          </div>

          <div className="space-y-4 p-4">
            {/* Now playing screen */}
            <div className="radio-screen relative overflow-hidden rounded-xl border-2 border-line p-4">
              <p className="readout text-mute">Now playing</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div className="min-w-0" aria-live="polite">
                  <p className="truncate font-display text-2xl font-bold leading-tight text-cream">{track.title}</p>
                  <p className={`readout mt-1 ${accentText[track.accent]}`}>{track.mood}</p>
                </div>
                <Equalizer active={playing} bars={7} className="h-9 shrink-0" />
              </div>
            </div>

            {/* Transport + volume */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={radio.prev} aria-label="Previous song" className="radio-btn">
                  <SkipBack size={18} aria-hidden="true" fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={radio.toggle}
                  aria-label={playing ? 'Pause music' : 'Play music'}
                  className="radio-btn radio-btn-main"
                >
                  {playing ? <Pause size={22} aria-hidden="true" fill="currentColor" /> : <Play size={22} aria-hidden="true" fill="currentColor" />}
                </button>
                <button type="button" onClick={radio.next} aria-label="Next song" className="radio-btn">
                  <SkipForward size={18} aria-hidden="true" fill="currentColor" />
                </button>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => radio.setVolume(volume === 0 ? 0.6 : 0)}
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mute hover:text-cream"
                >
                  <VolumeIcon size={20} aria-hidden="true" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(volume * 100)}
                  onChange={(e) => radio.setVolume(Number(e.target.value) / 100)}
                  aria-label="Volume"
                  className="radio-range min-w-0 flex-1"
                  style={{ '--fill': `${Math.round(volume * 100)}%` } as CSSProperties}
                />
              </div>
            </div>

            {/* Song list */}
            <div>
              <p className="readout mb-2 text-mute">Choose a channel</p>
              <ul className="space-y-1.5">
                {tracks.map((t, i) => {
                  const current = i === index
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => (current && playing ? radio.pause() : radio.select(i))}
                        aria-current={current ? 'true' : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition-colors ${
                          current ? `${accentBorder[t.accent]} bg-void/70` : 'border-transparent hover:border-line hover:bg-void/40'
                        }`}
                      >
                        <span className={`readout grid h-7 w-7 shrink-0 place-items-center rounded-md border ${current ? `${accentBorder[t.accent]} ${accentText[t.accent]}` : 'border-line text-mute'}`}>
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-semibold ${current ? 'text-cream' : 'text-cream/90'}`}>{t.title}</span>
                          <span className="block truncate text-xs text-mute">{t.mood}</span>
                        </span>
                        {current && <Equalizer active={playing} className={`h-4 ${accentText[t.accent]}`} />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Credits */}
            <section aria-label="Song credits" className="rounded-xl border border-line/80 bg-void/50 p-3">
              <p className="readout mb-2 text-gold">Song credits</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-mute">Track</dt>
                <dd className="text-cream">{track.title}</dd>
                <dt className="text-mute">By</dt>
                <dd className="text-cream">{track.composer}</dd>
                <dt className="text-mute">Licence</dt>
                <dd className="text-cream">{track.license}</dd>
              </dl>
              <p className="mt-2 text-xs leading-relaxed text-mute">
                {track.note}
                {track.sourceUrl && (
                  <>
                    {' '}
                    <a href={track.sourceUrl} target="_blank" rel="noreferrer" className="text-sky underline underline-offset-2">
                      Source
                    </a>
                  </>
                )}
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
