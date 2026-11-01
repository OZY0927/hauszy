# Firebase admin setup (Next.js)

Admin access is restricted to Firebase UID `7gyEPhGlL6V8DlLb5dNGzuwO95A2` using Email/Password authentication. Other signed-in users have no management access, even if they create an account through Firebase's public API. This approved UID is intentionally public configuration, not a password or secret.

The approved UID must match in `lib/admin-access.js`, `firestore.rules` and `storage.rules`. No custom claim or service-account key is required for the application. Changing the public profile email does not grant admin privileges. To change the owner, verify the new UID in Firebase Authentication and update all three allowlists together.

## Deployment order

1. Confirm the approved UID belongs to the intended account in Firebase Authentication → Users. The owner supplied the UID above.
2. Deploy the reviewed database and upload rules to close direct Firebase access to other accounts:

```sh
firebase deploy --only firestore:rules,storage --project hauszy
```

3. Deploy the Next.js app. Sign out and sign in as the approved owner; verify project editing, Categories, About Me, image uploads, publishing and cache refresh. A production build alone does not deploy the Firebase rules.
4. Test denial using an ordinary account in an emulator/staging environment. Do not weaken the UID checks to debug sign-in failures.

## Data and sessions

- `projects/{id}` and `adminSettings/projectOptions`: approved owner only.
- `publicProjects/{id}`: anonymous reads require Published status; owner controls writes. Public project queries must filter by Published status.
- `siteContent/about`: public profile and gallery; approved owner controls writes.
- Storage `projects/{id}/{file}` and `profile/{file}`: approved owner can upload JPEG/PNG/WebP files up to 5 MB and delete them. Updates and other paths are denied. Download-token URLs remain shareable bearer links; do not upload confidential documents.
- Admin authentication uses browser-session persistence and signs out after 30 minutes of inactivity. The browser needs to stay online for remote sign-out and saves. Public pages cache data for up to five minutes, with authenticated cache refresh after saves.

## Additional Firebase / hosting controls

Enable Firebase email-enumeration protection, enforce a strong password policy, restrict authorized sign-in domains to trusted hosts, and review unexpected users. Use MFA on the Google/Firebase/Vercel administrator accounts. Consider Firebase Auth MFA for the app owner as a separate, tested sign-in feature; it is not implemented by these changes. Configure spending alerts, backups and hosting firewall/rate-limit rules. App Check can be added after configuring providers and testing legitimate traffic; do not enable enforcement blindly.

See `SECURITY.md` for the implemented defenses, their limits, and validation.

## Admin sections

Project listing, About Me, Categories and Settings separate the workspace. Categories stores shared dropdown options in `adminSettings/projectOptions`. Settings reauthenticates the current account before changing its password. Removing or renaming dropdown values does not rewrite existing projects.

## Supabase uploads

New uploads use Supabase Storage; Firebase Storage rules apply only to legacy media/access. Configure the Supabase environment values and bucket restrictions in `SUPABASE_SETUP.md`. Project, portrait and deal-gallery URLs remain stored in Firestore.
