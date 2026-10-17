# Impostor Protocol: an Among Us event landing page

A fan-made, laptop-first landing page (responsive down to phones) built with React, Vite, TypeScript and Tailwind CSS.
Not affiliated with Innersloth. All illustrations are original SVG artwork.

## Run it locally

```bash
npm install        # once, downloads dependencies
npm run dev        # starts the dev server, open the URL it prints (usually http://localhost:5173)
npm run build      # type-checks and creates the production build in dist/
npm run preview    # serves dist/ locally so you can test the real build
```

## Change the event details (one file)

Edit **`src/config/event.ts`**. Anything set to `null` shows as a "To be announced" placeholder.

| To change | Edit |
| --- | --- |
| Event name, headline, description | `name`, `headline`, `description` |
| Date, time, venue, format, players | the `details` block |
| Show a real countdown | `startsAtISO`, e.g. `'2026-12-05T18:00:00+05:30'` (only appears if valid and in the future) |
| Send people to a Google Form | `registration.externalFormUrl` |
| Real social links | `socialLinks` |

## How the registration form behaves

- **Default (demo mode):** validates the fields and says clearly that nothing was saved or sent.
- **With `externalFormUrl`:** the form is replaced by a button that opens your official form in a new tab (the simplest real option).
- **With a form service:** set `VITE_REGISTRATION_ENDPOINT` (see `.env.example`) and the form POSTs JSON to it. That value is bundled into public browser code, so it must only ever be a public URL, never a secret. If you collect real emails, tell people what you will use them for and who can see them.

## Project map

```
src/config/event.ts        all event content (edit this)
src/index.css              design tokens (colors, fonts, radii), buttons, animations
src/components/            Navbar, Hero, EventInfo, Missions, Registration, Faq, Footer
src/components/art/        original SVG artwork: Cadet mascot, ShipWindow, Starfield
src/lib/validation.ts      form rules
src/hooks/                 countdown + active-section tracking
```

## Deploy: GitHub, then Vercel

1. Create a **new, empty** repository on github.com (do not reuse an existing project).
2. In this folder run:
   ```bash
   git init
   git add .
   git status            # review: there should be NO .env file and NO node_modules/dist
   git commit -m "Among Us event landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. On vercel.com choose **Add New, Project**, import that repository.
4. Vercel detects **Vite** automatically. Verify: Build Command `npm run build`, Output Directory `dist`. No environment variables are needed.
5. Click **Deploy**, then open the live URL and test it on your laptop and phone.
6. To update later: edit, commit and `git push`. Vercel redeploys automatically.

Common deployment errors: a build failing on a TypeScript error (run `npm run build` locally first), or a wrong Output Directory (must be `dist`).

## Security rules followed

No secrets in the code. `.env` files are git-ignored (only `.env.example` with placeholders is allowed). `VITE_` variables are public by design.
