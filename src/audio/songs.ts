/**
 * The four original tracks, written as code. Each song is a bpm plus a function
 * that says what plays on every 16th-note step; `step` counts up from 0 forever
 * and the song loops its chord progression.
 *
 * All four are original compositions dedicated to the public domain (CC0), so
 * they are safe to use anywhere with no attribution required.
 */
import type { Song } from './synth'

const pick = <T,>(list: readonly T[], i: number): T => list[i % list.length]

type Chord = { bass: number; notes: readonly number[] }

/* ------------------------------------------------------------------ */
/* 1. Cafeteria Drift: lo-fi, A minor, warm and relaxed                */
/* ------------------------------------------------------------------ */

const driftChords: readonly Chord[] = [
  { bass: 45, notes: [57, 60, 64, 67, 71] }, // Am9
  { bass: 41, notes: [57, 60, 64, 67, 69] }, // Fmaj9
  { bass: 48, notes: [55, 59, 64, 67, 71] }, // Cmaj9
  { bass: 43, notes: [59, 62, 66, 69, 74] }, // Gmaj9
]
// A-minor pentatonic phrase, 32 steps (two bars). -1 is a rest.
const driftMelody = [
  76, -1, -1, 72, -1, 74, -1, -1, 69, -1, -1, -1, 72, -1, 71, -1,
  -1, 67, -1, -1, 69, -1, 72, -1, -1, -1, 74, -1, 76, -1, -1, -1,
]

const cafeteriaDrift: Song = {
  bpm: 80,
  step(s, t, kit) {
    const bar = Math.floor(s / 16)
    const pos = s % 16
    const chord = pick(driftChords, bar)
    const beat = 60 / 80

    if (pos === 0) {
      chord.notes.forEach((note, i) => {
        kit.tone({
          note,
          t,
          dur: beat * 3.4,
          type: 'triangle',
          gain: 0.045,
          attack: 0.5,
          release: 0.9,
          detune: (i - 2) * 6,
          cutoff: 1400,
          wet: 0.7,
        })
      })
    }
    // Soft bass: root on the downbeat, answered a beat and a half later
    if (pos === 0 || pos === 10) {
      kit.tone({ note: chord.bass, t, dur: beat * 0.9, type: 'sine', gain: 0.3, attack: 0.02, release: 0.2 })
    }
    // Pluck melody
    const m = pick(driftMelody, s)
    if (m > 0) {
      kit.tone({ note: m, t, dur: 0.12, type: 'triangle', gain: 0.1, release: 0.5, cutoff: 2600, wet: 0.55 })
    }
    // Dusty drums
    if (pos === 0 || pos === 10) kit.kick(t, 0.38)
    if (pos === 8) kit.snare(t, 0.1)
    if (pos % 4 === 2) kit.hat(t, 0.035)
  },
}

/* ------------------------------------------------------------------ */
/* 2. Reactor Pulse: tense, D minor, driving and suspicious            */
/* ------------------------------------------------------------------ */

const pulseChords: readonly Chord[] = [
  { bass: 38, notes: [62, 65, 69, 72] }, // Dm7
  { bass: 34, notes: [58, 62, 65, 69] }, // Bbmaj7
  { bass: 43, notes: [58, 62, 67, 70] }, // Gm7
  { bass: 33, notes: [61, 64, 67, 70] }, // A7 (the unresolved one)
]

const reactorPulse: Song = {
  bpm: 104,
  step(s, t, kit) {
    const bar = Math.floor(s / 16)
    const pos = s % 16
    const chord = pick(pulseChords, bar)
    const beat = 60 / 104

    if (pos === 0) {
      // Dark pad with a clashing minor second on top
      for (const [i, note] of [...chord.notes.slice(0, 3), chord.notes[0] + 1].entries()) {
        kit.tone({
          note: note - 12,
          t,
          dur: beat * 3.6,
          type: 'sawtooth',
          gain: 0.03,
          attack: 0.7,
          release: 0.8,
          detune: (i - 1.5) * 8,
          cutoff: 700,
          wet: 0.6,
        })
      }
    }
    // Pumping eighth-note bass
    if (pos % 2 === 0) {
      kit.tone({
        note: chord.bass,
        t,
        dur: 0.13,
        type: 'sawtooth',
        gain: pos === 0 ? 0.36 : 0.26,
        release: 0.06,
        cutoff: pos === 0 ? 520 : 360,
      })
    }
    // Rotating arpeggio, a little wobbly through the filter
    const arpNote = pick(chord.notes, [0, 1, 2, 3, 2, 1, 3, 2][s % 8]) + 12
    if (pos % 2 === 1 || pos % 4 === 0) {
      kit.tone({
        note: arpNote,
        t,
        dur: 0.07,
        type: 'square',
        gain: 0.05,
        release: 0.1,
        cutoff: 900 + (s % 16) * 120,
        wet: 0.35,
      })
    }
    // Heartbeat kick + tick hats
    if (pos === 0 || pos === 6 || pos === 8 || pos === 14) kit.kick(t, pos === 0 ? 0.55 : 0.4)
    if (pos === 12) kit.snare(t, 0.12)
    if (pos % 2 === 0) kit.hat(t, 0.03, pos === 14)
    // Alarm "bleep" at the end of every fourth bar
    if (bar % 4 === 3 && (pos === 12 || pos === 14)) {
      kit.tone({ note: 81, t, dur: 0.08, type: 'square', gain: 0.05, release: 0.08, wet: 0.3 })
    }
  },
}

/* ------------------------------------------------------------------ */
/* 3. Starlight Vent: ambient, F lydian, slow and shimmering           */
/* ------------------------------------------------------------------ */

const ventChords: readonly Chord[] = [
  { bass: 29, notes: [57, 60, 64, 69, 72] }, // Fmaj7#11-ish
  { bass: 34, notes: [58, 62, 65, 69, 74] }, // Bbmaj9
  { bass: 36, notes: [60, 64, 67, 71, 74] }, // Cmaj9
  { bass: 31, notes: [59, 62, 67, 69, 74] }, // G6/9
]
// F lydian bells, played on a loose, off-beat grid
const ventBells = [77, 81, 84, 79, 86, 81, 84, 76, 88, 84, 79, 81]

const starlightVent: Song = {
  bpm: 66,
  step(s, t, kit) {
    const bar = Math.floor(s / 16)
    const pos = s % 16
    const chord = pick(ventChords, Math.floor(bar / 2))
    const beat = 60 / 66

    // One long chord every two bars
    if (s % 32 === 0) {
      chord.notes.forEach((note, i) => {
        kit.tone({
          note,
          t,
          dur: beat * 7,
          type: 'sine',
          gain: 0.05,
          attack: 1.8,
          release: 2.2,
          detune: (i - 2) * 5,
          wet: 0.9,
        })
      })
      kit.tone({ note: chord.bass, t, dur: beat * 7, type: 'sine', gain: 0.22, attack: 1.2, release: 2 })
    }
    // Glassy bells: sine plus an inharmonic partial for a metallic ring
    if (pos % 3 === 0 && (s * 7) % 5 !== 0) {
      const note = pick(ventBells, s)
      kit.tone({ note, t, dur: 0.05, type: 'sine', gain: 0.07, release: 1.8, wet: 0.9 })
      kit.tone({ note: note + 19.5, t, dur: 0.02, type: 'sine', gain: 0.012, release: 0.7, wet: 0.7 })
    }
    // A very quiet pulse, like a distant engine
    if (pos === 0 && bar % 2 === 0) kit.kick(t, 0.12)
  },
}

/* ------------------------------------------------------------------ */
/* 4. Emergency Meeting: chiptune, E minor, bouncy and loud           */
/* ------------------------------------------------------------------ */

const meetingChords: readonly Chord[] = [
  { bass: 40, notes: [64, 67, 71] }, // Em
  { bass: 36, notes: [64, 67, 72] }, // C
  { bass: 43, notes: [62, 67, 71] }, // G
  { bass: 38, notes: [62, 66, 69] }, // D
]
// E-minor-pentatonic hook, 32 steps (two bars)
const meetingLead = [
  76, -1, 79, -1, 83, -1, 79, 76, -1, -1, 74, -1, 76, -1, -1, -1,
  79, -1, 81, -1, 79, -1, 76, -1, 74, -1, 71, -1, 74, 76, -1, -1,
]

const emergencyMeeting: Song = {
  bpm: 128,
  step(s, t, kit) {
    const bar = Math.floor(s / 16)
    const pos = s % 16
    const chord = pick(meetingChords, bar)

    // Triangle bass jumping between octaves
    if (pos % 2 === 0) {
      const note = chord.bass + (pos % 4 === 2 ? 12 : 0)
      kit.tone({ note, t, dur: 0.12, type: 'triangle', gain: 0.3, release: 0.05 })
    }
    // Square-wave lead
    const lead = pick(meetingLead, s)
    if (lead > 0) {
      kit.tone({ note: lead, t, dur: 0.16, type: 'square', gain: 0.06, release: 0.08, cutoff: 3600, wet: 0.2 })
    }
    // Quiet chip arpeggio underneath
    kit.tone({
      note: pick(chord.notes, s) + 12,
      t,
      dur: 0.04,
      type: 'square',
      gain: 0.022,
      release: 0.04,
      cutoff: 2800,
    })
    // Drums
    if (pos % 4 === 0) kit.kick(t, 0.5)
    if (pos === 4 || pos === 12) kit.snare(t, 0.14)
    if (pos % 2 === 0) kit.hat(t, 0.04, pos % 8 === 6)
  },
}

export const songs: Record<string, Song> = {
  'cafeteria-drift': cafeteriaDrift,
  'reactor-pulse': reactorPulse,
  'starlight-vent': starlightVent,
  'emergency-meeting': emergencyMeeting,
}
