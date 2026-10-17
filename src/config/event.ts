/**
 * ONE FILE TO EDIT: every piece of event information on the site comes from here.
 *
 * Rules of this file:
 *  - Anything set to `null` is shown on the page as a clearly marked
 *    "To be announced" placeholder. Nothing is invented for you.
 *  - Replace `null` with real text once the organizers confirm a detail.
 */

export type EventDetailKey =
  | 'date'
  | 'time'
  | 'format'
  | 'venue'
  | 'gameMode'
  | 'players'
  | 'registration'

export const eventConfig = {
  // Working title and copy. Change freely: it is branding, not a fact about the event.
  name: 'Impostor Protocol',
  tagline: 'An Among Us event',
  headline: 'Trust no one. Find the impostor.',
  description:
    'An upcoming Among Us event: finish your tasks, read the room, and call the meeting before the lights go out. Scroll down for the briefing and the sign-up.',

  /**
   * Countdown. Leave as `null` until the real start is confirmed.
   * Use ISO format WITH a time zone, e.g. '2026-12-05T18:00:00+05:30'.
   * The countdown only appears when this is a valid date in the future.
   */
  startsAtISO: null as string | null,

  /** Text shown in the event-information section. `null` = placeholder. */
  details: {
    date: 'Saturday, 5 December 2026' as string | null, // e.g. 'Saturday, 5 December 2026'
    time: '6:00 PM IST, doors open 5:30 PM' as string | null, // e.g. '6:00 PM IST'
    format: 'Online, play from home' as string | null, // e.g. 'Online' or 'In person'
    venue: 'Private Discord server with voice channels (invite sent after sign-up)' as string | null, // e.g. 'Discord server' or a room name
    gameMode: 'Among Us' as string | null,
    players: '10 players per lobby, up to 6 lobbies, 3 impostors in the final round' as string | null, // e.g. '10 players per lobby'
    registration: 'Free entry, sign-ups close 1 December or when all lobbies are full' as string | null, // e.g. 'Open until 1 December'
  } satisfies Record<EventDetailKey, string | null>,

  /**
   * Registration.
   *  - externalFormUrl: paste a Google Form (or similar) link and the site will
   *    send people there instead of showing the built-in form.
   *  - endpoint: a public form-service URL (via VITE_REGISTRATION_ENDPOINT).
   *    If neither is set, the built-in form runs in DEMO mode and saves nothing.
   */
  registration: {
    externalFormUrl: null as string | null,
    endpoint: (import.meta.env.VITE_REGISTRATION_ENDPOINT as string | undefined) || null,
  },

  /** Add only REAL social links, e.g. { label: 'Instagram', href: 'https://...' } */
  socialLinks: [] as { label: string; href: string }[],
}

export const PLACEHOLDER_LABEL = 'To be announced'
