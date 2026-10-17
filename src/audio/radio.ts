/**
 * The ship radio: one small store that owns playback so any component can
 * show or control it (React reads it through `useRadio`).
 *
 * Browsers only allow sound after a click or tap, so nothing plays on load.
 * The AudioContext is created the first time the visitor presses play.
 */
import { useSyncExternalStore } from 'react'
import { tracks } from '../config/music'
import { songs } from './songs'
import { Kit, type Song } from './synth'

export type RadioState = {
  playing: boolean
  index: number
  /** 0..1 */
  volume: number
}

// Bumped to v2 so everyone's old saved choice (stored by position) is dropped once and the new default applies.
const STORAGE_KEY = 'spark-radio-v2'
const DEFAULT_VOLUME = 0.6
/** The song new visitors hear first. Change this id to make a different track the default. */
const DEFAULT_TRACK_ID = 'emergency-meeting'
const DEFAULT_INDEX = Math.max(0, tracks.findIndex((t) => t.id === DEFAULT_TRACK_ID))

function load(): Pick<RadioState, 'index' | 'volume'> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    // The saved choice is the track id, so reordering the playlist never changes what someone picked.
    const saved = tracks.findIndex((t) => t.id === raw.trackId)
    const index = saved >= 0 ? saved : DEFAULT_INDEX
    const volume = typeof raw.volume === 'number' && raw.volume >= 0 && raw.volume <= 1 ? raw.volume : DEFAULT_VOLUME
    return { index, volume }
  } catch {
    return { index: DEFAULT_INDEX, volume: DEFAULT_VOLUME }
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ trackId: tracks[state.index].id, volume: state.volume }))
  } catch {
    /* private mode or storage blocked: the radio still works, it just forgets */
  }
}

let state: RadioState = { playing: false, ...load() }
const listeners = new Set<() => void>()

function setState(patch: Partial<RadioState>) {
  state = { ...state, ...patch }
  save()
  listeners.forEach((l) => l())
}

/* ---------------- audio graph ---------------- */

type Playing = { stop: () => void }

let ctx: AudioContext | null = null
let master: GainNode | null = null
let current: Playing | null = null
let pauseTimer: number | undefined

// Squared so the slider feels even to the ear; the 1.4 is makeup gain for the quiet synths
const volumeCurve = (v: number) => v * v * 1.4

function ensureContext() {
  if (ctx && master) return { ctx, master }
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = volumeCurve(state.volume)
  // A gentle compressor keeps stacked pads and drums from clipping
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -14
  comp.ratio.value = 4
  master.connect(comp)
  comp.connect(ctx.destination)
  return { ctx, master }
}

function startSynth(song: Song): Playing {
  const { ctx, master } = ensureContext()
  const kit = new Kit(ctx, master)
  kit.out.gain.setValueAtTime(0.0001, ctx.currentTime)
  kit.out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.5)

  const stepLength = 60 / song.bpm / 4
  let step = 0
  let nextTime = ctx.currentTime + 0.1

  // Look ahead a little so timing stays tight; look further when the tab is
  // in the background because browsers slow timers down there.
  const tick = () => {
    const horizon = ctx.currentTime + (document.hidden ? 1.5 : 0.25)
    while (nextTime < horizon) {
      song.step(step, nextTime, kit)
      nextTime += stepLength
      step++
    }
  }
  tick()
  const timer = window.setInterval(tick, 40)

  return {
    stop() {
      window.clearInterval(timer)
      const now = ctx.currentTime
      kit.out.gain.cancelScheduledValues(now)
      kit.out.gain.setValueAtTime(kit.out.gain.value, now)
      kit.out.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
      window.setTimeout(() => kit.out.disconnect(), 600)
    },
  }
}

function startFile(src: string): Playing {
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = state.volume
  audio.play().catch(() => setState({ playing: false }))
  return {
    stop() {
      audio.pause()
      audio.src = ''
    },
  }
}

function startCurrent() {
  current?.stop()
  const track = tracks[state.index]
  const song = songs[track.id]
  if (track.src) current = startFile(track.src)
  else if (song) current = startSynth(song)
  else current = null
}

/* ---------------- public controls ---------------- */

function play() {
  window.clearTimeout(pauseTimer)
  const { ctx, master } = ensureContext()
  void ctx.resume()
  master.gain.setTargetAtTime(volumeCurve(state.volume), ctx.currentTime, 0.03)
  // Generated songs keep their place while paused; file tracks are torn down on pause and restart here
  if (!current) startCurrent()
  setState({ playing: true })
}

function pause() {
  if (ctx && master) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.04)
    pauseTimer = window.setTimeout(() => void ctx?.suspend(), 250)
  }
  if (tracks[state.index].src) {
    current?.stop()
    current = null
  }
  setState({ playing: false })
}

function select(index: number) {
  const next = (index + tracks.length) % tracks.length
  state = { ...state, index: next }
  current?.stop()
  current = null
  play()
}

function setVolume(volume: number) {
  const v = Math.min(1, Math.max(0, volume))
  if (ctx && master) master.gain.setTargetAtTime(volumeCurve(v), ctx.currentTime, 0.03)
  setState({ volume: v })
}

export const radio = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getState: () => state,
  toggle: () => (state.playing ? pause() : play()),
  play,
  pause,
  select,
  next: () => select(state.index + 1),
  prev: () => select(state.index - 1),
  setVolume,
}

export function useRadio() {
  const snapshot = useSyncExternalStore(radio.subscribe, radio.getState, radio.getState)
  return { ...snapshot, track: tracks[snapshot.index], tracks, radio }
}
