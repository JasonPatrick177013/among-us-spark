/**
 * A tiny Web Audio synth kit. Every sound on the "ship radio" is generated here
 * in the browser, so there are no audio files, no licences to track and nothing
 * extra to download.
 */

export const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12)

type ToneOptions = {
  /** MIDI note number */
  note: number
  /** Start time in AudioContext seconds */
  t: number
  /** Held length in seconds (release is added on top) */
  dur: number
  type?: OscillatorType
  gain?: number
  attack?: number
  release?: number
  /** Cents of detune, handy for thick pads */
  detune?: number
  /** Low-pass cutoff in Hz */
  cutoff?: number
  /** 0..1 amount sent to the reverb */
  wet?: number
  /** Start this many semitones away and glide to the note */
  glide?: number
}

type NoiseOptions = {
  t: number
  dur: number
  gain?: number
  highpass?: number
  lowpass?: number
  wet?: number
}

/** One Kit per playing song. Disconnecting `out` silences everything it made. */
export class Kit {
  readonly out: GainNode
  private readonly dry: GainNode
  private readonly wet: GainNode
  private readonly reverb: ConvolverNode
  private readonly noise: AudioBuffer
  readonly ctx: BaseAudioContext

  constructor(ctx: BaseAudioContext, destination: AudioNode) {
    this.ctx = ctx
    this.out = ctx.createGain()
    this.out.connect(destination)

    this.dry = ctx.createGain()
    this.dry.connect(this.out)

    this.reverb = ctx.createConvolver()
    this.reverb.buffer = makeImpulse(ctx, 2.6, 2.8)
    this.wet = ctx.createGain()
    this.wet.gain.value = 0.9
    this.wet.connect(this.reverb)
    this.reverb.connect(this.out)

    this.noise = makeNoise(ctx)
  }

  tone({
    note,
    t,
    dur,
    type = 'sine',
    gain = 0.2,
    attack = 0.005,
    release = 0.12,
    detune = 0,
    cutoff,
    wet = 0,
    glide,
  }: ToneOptions) {
    const { ctx } = this
    const osc = ctx.createOscillator()
    osc.type = type
    const hz = midiToHz(note)
    if (glide) {
      osc.frequency.setValueAtTime(midiToHz(note + glide), t)
      osc.frequency.exponentialRampToValueAtTime(hz, t + Math.min(0.08, dur))
    } else {
      osc.frequency.setValueAtTime(hz, t)
    }
    osc.detune.value = detune

    const env = ctx.createGain()
    const end = t + dur + release
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(gain, t + attack)
    env.gain.setValueAtTime(gain, t + Math.max(attack, dur))
    env.gain.exponentialRampToValueAtTime(0.0001, end)

    let node: AudioNode = osc
    if (cutoff) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = cutoff
      lp.Q.value = 0.7
      osc.connect(lp)
      node = lp
    }
    node.connect(env)
    env.connect(this.dry)
    if (wet > 0) this.send(env, wet)

    osc.start(t)
    osc.stop(end + 0.05)
  }

  hit({ t, dur, gain = 0.15, highpass = 0, lowpass = 0, wet = 0 }: NoiseOptions) {
    const { ctx } = this
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true

    let node: AudioNode = src
    if (highpass) {
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = highpass
      node.connect(hp)
      node = hp
    }
    if (lowpass) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = lowpass
      node.connect(lp)
      node = lp
    }

    const env = ctx.createGain()
    env.gain.setValueAtTime(gain, t)
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    node.connect(env)
    env.connect(this.dry)
    if (wet > 0) this.send(env, wet)

    src.start(t)
    src.stop(t + dur + 0.05)
  }

  kick(t: number, gain = 0.5) {
    const { ctx } = this
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12)
    const env = ctx.createGain()
    env.gain.setValueAtTime(gain, t)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    osc.connect(env)
    env.connect(this.dry)
    osc.start(t)
    osc.stop(t + 0.32)
  }

  snare(t: number, gain = 0.2) {
    this.hit({ t, dur: 0.16, gain, highpass: 1400, wet: 0.25 })
    this.tone({ note: 52, t, dur: 0.04, type: 'triangle', gain: gain * 0.7, release: 0.08 })
  }

  hat(t: number, gain = 0.06, open = false) {
    this.hit({ t, dur: open ? 0.22 : 0.045, gain, highpass: 7000 })
  }

  private send(from: AudioNode, amount: number) {
    const g = this.ctx.createGain()
    g.gain.value = amount
    from.connect(g)
    g.connect(this.wet)
  }
}

/** Shared white-noise buffer, one second long (looped for longer hits). */
const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>()
function makeNoise(ctx: BaseAudioContext) {
  const cached = noiseCache.get(ctx)
  if (cached) return cached
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noiseCache.set(ctx, buffer)
  return buffer
}

/** Synthetic reverb tail: decaying stereo noise. */
function makeImpulse(ctx: BaseAudioContext, seconds: number, decay: number) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
    }
  }
  return buffer
}

/** A song is a tempo plus a function that plays whatever happens on one 16th-note step. */
export type Song = {
  bpm: number
  /** `step` counts 16th notes since the song started. */
  step: (step: number, t: number, kit: Kit) => void
}
