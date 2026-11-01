# Security hardening — 1 November 2026

## Fixed

- **Excessive Firebase privileges:** previously any email/password account could read private projects, edit the public profile, publish projects and upload/delete media. Both rules files now require the owner-confirmed UID `7gyEPhGlL6V8DlLb5dNGzuwO95A2` plus password authentication. The client checks the same account. Anonymous reads of `publicProjects` now require Published status.
- **Cache-refresh authentication:** the API now verifies Firebase JWT signatures against Google's signing keys using `jose`, pins RS256/issuer/audience, checks expiry, subject, auth time and allowed UID/provider, and uses Firebase account lookup to reject disabled accounts or sessions older than `validSince`. It does not trust decoded-but-unverified JWTs or client-supplied role flags. No service-account key is shipped.
- **API abuse resistance:** rejects cross-site origins, malformed bearer credentials, non-JSON content, bodies larger than 4 KiB (including streaming requests) and unknown/empty cache tags. Responses are non-cacheable. An authenticated per-UID throttle limits ten refreshes/minute per server process. This is deliberately not described as a globally distributed rate limiter; use the deployment platform's firewall for global request/abuse controls.
- **Browser protections:** CSP, frame denial, MIME-sniff prevention, referrer policy, permissions restrictions, production HSTS, opener isolation compatible with WhatsApp popups, and no X-Powered-By. The admin receives a per-request nonce CSP and no-store response, with dynamic rendering only for that route. Public static pages permit inline Next.js hydration scripts; their CSP restricts external script sources but is not a nonce-only XSS defense. Images remain HTTPS-compatible for existing project media and approved uploads. No HSTS subdomain/preload commitment was added.
- **Session exposure:** session-scoped Firebase persistence is retained and an idle logout runs after 30 minutes. Password changes still require reauthentication. This is browser idle sign-out, not a server-enforced inactivity expiry or refresh-token revocation.
- **Untrusted input:** shared HTTPS URL parsing rejects malformed URLs, embedded credentials, control characters and backslash ambiguity. JSON imports are bounded to 200,000 characters, 100 layouts and 200 amenities, with string limits. Images remain capped at ten and 5 MB uploads are enforced by Storage rules. JSON-LD already escapes `<`; React text rendering is retained.

## Deployment is required

Deploy Firebase rules separately from the app as described in `ADMIN_SETUP.md`. Until deployed, the old live rules remain permissive. New headers/API/client protections take effect only on the new app deployment. No production rules, Auth users or hosting settings were modified by the local implementation.

Retest the approved owner login, Firestore edits, profile saves, uploads and public reads after deployment. For Firebase rules, verify anonymous/non-owner access is denied, owner access succeeds, published-only queries succeed, archived public documents are denied, image uploads honor size/type limits, and arbitrary storage paths remain denied.

## Validation and limits

Automated tests exercise allowed/non-owner identities, signed and forged JWTs, disabled/revoked sessions, upstream auth failures, request shape/body limits, cache-tag allowlists, throttling, URL tricks, CSP configuration and JSON import limits. Production build and dependency audit are also run. Local HTTP checks cover actual response headers, nonce injection and API rejection behavior (`node scripts/security-smoke.mjs` while the production server runs on port 3001). The admin login also rendered and hydrated under its nonce CSP in a browser.

Firebase emulator rule execution was unavailable because no Java runtime is installed. The rules have been reviewed but must still be tested with the emulator or Firebase console before production rollout. A local build cannot establish live TLS, account security or global firewall settings. Dependency audits report known advisories only, not proof that a site is vulnerability-free.

## Remaining operational protections

- Enforce a strong Firebase password policy and email-enumeration protection. Secure Google Cloud/Firebase and hosting administrator accounts with MFA.
- Review authorized domains, unknown Auth users, IAM privileges and project API-key application/API restrictions. Firebase web API keys are public identifiers; access must be enforced by Auth/rules, not hidden keys.
- Configure platform-level global API rate limits/WAF, billing alerts and backups. Never expose private source notes, client documents or credentials in `publicProjects`, profile content or shareable Storage links.
- Consider a dedicated public-project projection to avoid publishing admin/source notes. Current records can contain such notes; this hardening does not silently rewrite the existing database.
- Review Firebase App Check and app-user MFA separately; both need provider/account setup and compatibility testing and are not active here.

## Official references

- https://firebase.google.com/docs/rules/rules-and-auth
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
- https://firebase.google.com/docs/reference/rest/auth#section-get-account-info
- https://nextjs.org/docs/app/guides/content-security-policy
- https://github.com/panva/jose

## Cloudflare/font compatibility follow-up

The CSP explicitly permits Google Fonts CSS/font origins and the public Cloudflare Web Analytics beacon/reporting origins. Admin script nonce restrictions remain intact, and admin responses prohibit intermediary HTML transformation. Shared navigation prefetching is disabled to avoid unnecessary speculative requests. See `CLOUDFLARE_TROUBLESHOOTING.md` for the live checks and the distinction between CSP violations and HTTP 503 responses.
