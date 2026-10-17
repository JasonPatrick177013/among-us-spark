/**
 * The ship radio playlist, shown in the navbar player.
 *
 * Every track below is an ORIGINAL composition generated live in the browser by
 * `src/audio/songs.ts`, dedicated to the public domain under CC0 1.0. That means
 * no copyright claims, no attribution required, and no audio files to host.
 * The credits are still shown in the player so listeners know who made what.
 *
 * Want to add a real recording instead? Drop an .mp3 into `public/audio/` and add
 * an entry with a `src` (see the commented example at the bottom). Only use music
 * you have the right to use, and copy its credit line exactly as the artist asks.
 */

export type TrackAccent = 'gold' | 'sky' | 'violet' | 'sus' | 'lime'

export type Track = {
  /** Unique id. For generated tracks it must match a key in `songs` (src/audio/songs.ts). */
  id: string
  title: string
  /** Short vibe label shown under the title */
  mood: string
  /** Who made it (shown in the credits) */
  composer: string
  /** Licence line (shown in the credits) */
  license: string
  /** One sentence about the track */
  note: string
  /** Accent colour token used for this track's chip */
  accent: TrackAccent
  /** Set this to play a real audio file instead of a generated song, e.g. '/audio/my-song.mp3' */
  src?: string
  /** Optional link to the source page of a file track (shown in the credits) */
  sourceUrl?: string
}

const composer = 'Claude, for SPARK'
const license = 'CC0 1.0: original, public domain'

export const tracks: readonly Track[] = [
  {
    id: 'cafeteria-drift',
    title: 'Cafeteria Drift',
    mood: 'Lo-fi chill',
    composer,
    license,
    note: 'Warm chords and a soft pluck melody for the quiet minutes before a round starts.',
    accent: 'gold',
  },
  {
    id: 'reactor-pulse',
    title: 'Reactor Pulse',
    mood: 'Tense, suspicious',
    composer,
    license,
    note: 'A throbbing bass and a nervous arpeggio. Someone in the room is definitely lying.',
    accent: 'sus',
  },
  {
    id: 'starlight-vent',
    title: 'Starlight Vent',
    mood: 'Ambient space',
    composer,
    license,
    note: 'Slow glassy bells drifting over long chords. Best with the Observation Deck in view.',
    accent: 'violet',
  },
  {
    id: 'emergency-meeting',
    title: 'Emergency Meeting',
    mood: '8-bit upbeat',
    composer,
    license,
    note: 'A bouncy chiptune hook at 128 bpm to get everyone out of their chairs.',
    accent: 'sky',
  },
  // Example of a real recording (uncomment, then put the file in public/audio/):
  // {
  //   id: 'my-song',
  //   title: 'Song Title',
  //   mood: 'Whatever it feels like',
  //   composer: 'Artist Name',
  //   license: 'CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
  //   note: 'Music: "Song Title" by Artist Name, from example.com',
  //   accent: 'lime',
  //   src: '/audio/my-song.mp3',
  //   sourceUrl: 'https://example.com/song-page',
  // },
]
