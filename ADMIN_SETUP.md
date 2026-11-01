# Firebase admin setup (Next.js)

1. Firebase Authentication → Sign-in method: enable Email/Password.
2. Create permitted accounts in Authentication → Users.
3. Create Firestore if needed and deploy the reviewed `firestore.rules`.
4. Deploy reviewed `storage.rules` for project and profile image uploads.
5. Open `/admin` and sign in with email and password.

Public configuration for project `hauszy` is in `lib/firebase-config.js`. No email verification or custom admin claim is required by the current account policy. Any Firebase email/password account has management access. Hiding sign-up in this application does not prevent account creation through Firebase Auth APIs; configure server-enforced sign-up restrictions if only owner-created accounts should have access.

## Data

- `projects/{id}`: authenticated project editing, including drafts and archived records.
- `publicProjects/{id}`: customer-facing published copy; anonymous public reads.
- `siteContent/about`: public profile and successful-deal gallery.
- Storage `projects/{id}/{file}` and `profile/{file}`: authenticated JPEG/PNG/WebP uploads, max 5 MB each. Download URLs are shareable bearer links; do not upload confidential media.

The admin verifies committed saves with a Firestore server read. Public Next.js pages fetch published records server-side on each request using anonymous REST requests that honour rules. Profile uploads and project saves show errors without pretending they succeeded. Offline demo is explicitly separate and browser-only. Removed/abandoned uploaded media is not automatically deleted from Storage.

## Deployment

With Firebase CLI installed and logged into the intended project, review existing rules before running:

```sh
firebase deploy --only firestore:rules,storage --project hauszy
```

Deploy Next.js on Vercel using the Next.js preset. Add the hosted admin domain to Firebase Authentication authorised domains as needed. Existing Firebase resources and rules are not modified merely by running this app or its production build.

## Admin sections

The admin workspace has Project listing, About Me, Categories, and Settings sections. Settings changes the signed-in account password after verifying its current password. Categories stores shared dropdown values in `adminSettings/projectOptions`; deploy the updated Firestore rules before using this section. Its initial values include defaults, existing project values, and any legacy categories saved in the current browser. Removing or renaming an option does not rewrite existing projects.
