# Hauszy Property

Malaysian developer-project website with a Firebase-backed admin, project search, project pages, profile and successful-deal gallery, and loan calculator.

## Local development

Requires Node.js and Python 3. No npm dependency installation is needed for the static frontend.

```sh
npm run dev
```

Open http://localhost:3000. The preview server disables caching during development.

## Pages

- `/` — homepage
- `/projects.html` — published projects, location search and price range
- `/property.html?id=PROJECT_ID` — project details
- `/about.html` — agent profile and successful-deal gallery
- `/loan-calculator.html` — loan and purchase-cost estimates
- `/admin/` — Firebase email/password project management

## Firebase

Public web configuration is in `admin/firebase-config.js`. It is not a service-account credential. Data access relies on deployed Firestore and Storage rules.

Read [ADMIN_SETUP.md](ADMIN_SETUP.md) for setup, authentication and deployment details. Public pages read `publicProjects`; private editable records are in `projects`. Profile content is in `siteContent/about`. Media uses Firebase Storage.

All authenticated email/password accounts currently receive project-management access, as requested. Offline demo is separate and does not publish data.

## Hosting

Deploy as a static site on Vercel with the repository root as the output directory. Do not use the Python development server in production. Firebase rules must be deployed separately.

## Current limitations

Enquiry and appointment forms are previews; WhatsApp needs the actual agent number. Loan results are planning estimates. Confirm deployment rules and authentication configuration before live use.
