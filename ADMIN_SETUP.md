# Admin email/password setup

1. Firebase Authentication → Sign-in method: enable Email/Password.
2. Authentication → Users: create each account allowed to manage projects. No specific email, email verification or admin custom claim is required by this application.
3. Create Firestore if needed. Review existing rules and publish the supplied firestore.rules in Firestore → Rules. The updated rules permit any authenticated email/password account to manage projects and published records; other paths remain denied.
4. Open /admin/ and sign in. Incorrect credentials, disabled accounts, throttling, network errors and database permission failures have friendly messages.

Important: all Firebase email/password accounts get management access. Hiding sign-up in this app does not prevent account creation through Firebase Auth APIs. For an owner-provisioned-only account policy, configure server-enforced sign-up restrictions (such as Identity Platform blocking functions); no such restriction has been deployed here.

Configuration for project hauszy is installed. Security rules still need deployment; no live sign-in test or rule deployment has been performed. Project photos can now be chosen from the device. Deploy storage.rules to enable authenticated image uploads (JPG/PNG/WebP, maximum 5 MB). Uploaded download URLs are shareable bearer links; do not upload confidential media. Floor plans and brochures still use optional HTTPS links. The public homepage, projects.html and property.html now read published records from publicProjects. Save a project with Published status to show it to visitors; Draft or Archived removes its public copy. Refresh the public page to see saved changes. Demo mode stores browser-only changes and has no live access.

## Friendly project editor
Unit types use repeatable manual fields rather than JSON. Photos support device selection, previews, removal and cover selection (maximum 10). Demo photos are compressed into browser storage; live photos upload to Firebase Storage. Abandoned/removed uploaded files are not automatically deleted from Storage. Review unused media periodically.

## Verified Firestore data flow
Real sign-in mode reads projects with getDocsFromServer. Saves commit both the private project and published copy in one Firestore batch, using a server timestamp, then read the saved document back from the server before showing success. Public lists read publicProjects from the server; project detail pages fetch the selected document directly from publicProjects. Offline demo remains explicitly separate and never updates public data. Photos live in Firebase Storage; project documents store their download URLs.
