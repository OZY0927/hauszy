# Hauszy Property

A Next.js App Router application for Malaysian developer-direct projects, using React, Firebase and Leaflet.

## Development

Requires Node.js 20.9 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The Python preview server and static HTML runtime have been replaced.

```sh
npm test
npm run build
npm start
```

## Routes

- `/` — homepage
- `/projects` — server-rendered published projects with interactive filters and saved projects
- `/projects/[id]` — project details, gallery, map and enquiry previews
- `/about` — profile and successful-deal gallery
- `/tools/loan-calculator` — calculator, with optional project-prefill query parameters
- `/admin` — Firebase email/password project management and profile editor

Legacy `.html` URLs redirect to the new routes, preserving existing project IDs and calculator parameters.

## Architecture

- `app/` — Next.js routes, server rendering and shared layout
- `components/` — React filters, galleries, map, calculator and admin UI
- `lib/` — Firebase client, anonymous Firestore REST server reads, data validation and calculation helpers
- `public/` — static visual assets
- `tests/` — pricing filters, calculator and editor validation tests

Public Firestore reads run on the server with no service account and honour deployed Security Rules. Public pages have request-time rendering and do not fall back to sample projects. The admin uses the modular Firebase SDK in the browser. Saves atomically update the private `projects` document and published `publicProjects` copy; changing a project to Draft or Archived removes its published copy. Profile information uses `siteContent/about`; media lives in Firebase Storage.

Public Firebase configuration is in `lib/firebase-config.js`. This configuration is not a private key. No service-account credential is needed or included. Deploy Firebase rules separately.

## Vercel

Import the repository and select the **Next.js** framework preset. Use the default build command `npm run build` and default output settings; remove any old static output-directory override. The app requires a Next.js server/runtime and is not a static export.

## Known product limits

WhatsApp requires the actual agent number. Enquiry and viewing forms remain clearly marked previews. Loan results are planning estimates with configurable costs. Offline admin demo is browser-only; normal sign-in reads and writes Firestore. No production rules or hosting deployment is performed by a local build.
