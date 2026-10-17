<div align="center">

# Impostor Protocol

**A fan-made landing page for an Among Us event.**

Laptop-first, fully responsive, and accessible, with an original space-station theme.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

> **Disclaimer:** This is an unofficial fan project and is not affiliated with Innersloth. All illustrations are original SVG artwork.

---

## Overview

Impostor Protocol is a single-page event site: hero with call to action, mission briefing, event details, FAQ and a registration section. Every piece of event content is driven from one configuration file, so updating the site for a real event takes minutes and requires no changes to components.

## Features

- **Responsive, laptop-first layout** that scales down cleanly to tablets and phones
- **Single source of truth** for all event content in `src/config/event.ts`
- **Scroll tour, schedule timeline and opening-box section transitions, a progress rail and a themed cursor**, all keyboard friendly and static under reduced motion
- **Reactor mini-game** that works with keyboard, touch and screen readers
- **Ship radio** in the navbar: on/off, change song, volume and song credits, with four original CC0 tracks generated in the browser (no audio files)
- **Optional live countdown** that only appears when a valid future start date is set
- **Three registration modes**: demo form, external form link, or a public form-service endpoint
- **Client-side form validation** with clear, inline error messages
- **Accessible by design**: keyboard navigation, visible focus states, labelled form fields, ARIA-linked FAQ accordion
- **Reduced-motion support**: animations switch off for users who request it
- **Original SVG artwork**: custom cadet mascots, ship window and animated starfield
- **Design tokens** for colors, fonts and radii in a single CSS file

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Fonts | Space Grotesk, Inter (via Fontsource) |
| Linting | Oxlint |

## Ship radio (music)

The navbar has a split-pill music control: the left half turns music on or off, the right half opens a panel with a track list, previous/next, volume and the song credits. Nothing plays until the visitor clicks, because browsers block autoplay.

- Playlist and credits live in `src/config/music.ts`.
- The four default tracks are original compositions written as code in `src/audio/songs.ts` and played with the Web Audio API. They are dedicated to the public domain (CC0), so there is nothing to licence or attribute.
- To add a real recording, put the `.mp3` in `public/audio/` and add an entry with `src` (there is a commented example in `music.ts`). Only use music you have the right to use, and copy the credit line the artist asks for into `composer`, `license` and `note`.
- The chosen song and volume are remembered in `localStorage`.

## Getting Started

**Prerequisites:** Node.js 18 or newer and npm.

```bash
# Install dependencies
npm install

# Start the dev server (usually http://localhost:5173)
npm run dev

# Type-check and create a production build in dist/
npm run build

# Serve the production build locally
npm run preview

# Lint the project
npm run lint
```

## Configuration

All event content lives in **`src/config/event.ts`**. Fields set to `null` render as a clearly marked "To be announced" placeholder.

| To change | Edit |
| --- | --- |
| Event name, headline, description | `name`, `headline`, `description` |
| Date, time, venue, format, players, registration info | the `details` block |
| The evening timeline | `schedule` |
| Live countdown | `startsAtISO`, an ISO date with time zone, e.g. `'2026-12-05T18:00:00+05:30'` |
| Send people to a Google Form | `registration.externalFormUrl` |
| Social links | `socialLinks` |

> The event details currently in the repository are placeholder content. Replace them with confirmed information before publishing.

## Registration

The registration section supports three modes, chosen automatically:

1. **Demo mode (default):** validates the fields and states clearly that nothing was saved or sent.
2. **External form:** when `registration.externalFormUrl` is set, the form is replaced by a button that opens your official form in a new tab.
3. **Form service:** when `VITE_REGISTRATION_ENDPOINT` is set (see `.env.example`), the form submits JSON to that endpoint.

If you collect real sign-ups, tell participants what their data is used for and who can see it.

## Project Structure

```
src/
├── config/
│   ├── event.ts          # All event content (edit this)
│   └── nav.ts            # Navigation links
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── EventInfo.tsx
│   ├── Journey.tsx       # Scroll tour with a sticky ship map
│   ├── ObservationDeck.tsx  # Four original SVG scenes
│   ├── Schedule.tsx      # Scroll-linked timeline
│   ├── ScrollRail.tsx    # Right-edge progress rail with a sliding cadet
│   ├── CursorGlow.tsx    # Neon ring that trails the mouse
│   ├── Missions.tsx
│   ├── ReactorGame.tsx   # Reactor mini-game
│   ├── Registration.tsx
│   ├── Faq.tsx
│   ├── Footer.tsx
│   ├── art/              # Original SVG artwork (Cadet, ShipWindow, Starfield, Scenes)
│   └── ui/               # Logo, Reveal, SectionHeading, SectionTransition (the opening box)
├── hooks/                # Countdown and active-section tracking
├── lib/                  # Form validation and navigation helpers
└── index.css             # Design tokens, buttons, panels, animations
```

## Deployment

The site is a static build and deploys to any static host.

No environment variables are required.

## Security

- No secrets are stored in the repository.
- `.env` files are git-ignored; only `.env.example` with placeholders is committed.
- `VITE_` variables are bundled into public browser code, so they must only ever contain public values.

## License

No license has been specified. Add a `LICENSE` file if you want others to reuse the code.
