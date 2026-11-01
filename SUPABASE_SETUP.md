# Supabase image storage on Cloudflare

New image uploads use Supabase Storage. Firebase remains the source of admin authentication and project/profile documents. Existing Firebase and external image URLs continue to render; there is no automatic migration or deletion of old images.

## 1. Bucket

In Supabase Storage create `website-images` (or set your chosen name below):

- Public bucket: enabled. Only upload media intended for public website display, including media on archived projects: anyone with the public URL can view it.
- File size restriction: 5 MB (5,242,880 bytes).
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Do not add anonymous INSERT, UPDATE or DELETE policies. A public bucket does not require public write access. This app authorizes uploads through an authenticated server endpoint and signed upload tokens. Avoid overwriting objects; the server generates a new random name for each upload.

Bucket-level MIME and size restrictions are essential because the binary upload goes directly from the browser to Supabase; the signing endpoint validates declared metadata, not file contents. A signed token is a temporary upload credential for one path and must not be logged or shared.

## 2. Environment values

| Variable | Location / use |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Connect dialog: HTTPS project origin such as `https://your-project.supabase.co`; public build and runtime value. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Settings → API Keys → publishable key (`sb_publishable_…`); public build value. |
| `SUPABASE_SECRET_KEY` | Settings → API Keys → secret key (`sb_secret_…`); server-only runtime secret. Never add a `NEXT_PUBLIC_` prefix. |
| `SUPABASE_STORAGE_BUCKET` | `website-images` or the bucket you created; runtime variable. |

For `npm run dev`, copy the appropriate settings into ignored `.env.local`. Keep real values out of `.env.example`, source control, screenshots and chat messages. `.dev.vars*` is ignored for Cloudflare local runtime secrets too.

## 3. Cloudflare

In Workers & Pages → your deployed application → Settings → Variables and Secrets:

- Add the project URL, publishable key and bucket as variables.
- Add `SUPABASE_SECRET_KEY` as an encrypted runtime secret.
- Use Node.js 22 or later for the build (the current Supabase SDK requires it).
- If using Workers Builds, add the `NEXT_PUBLIC_` values to build variables as well. The URL controls both the image optimizer allowlist and the Content Security Policy, so rebuild/redeploy after changing it.
- Configure production and preview environments separately. The secret must be present at runtime; a build-only secret is insufficient.
- The application requires a server-capable Next.js deployment for `/api/uploads/sign/`, the admin and existing API routes. A static-only Pages export cannot run it. This repository does not contain a Cloudflare adapter/Wrangler configuration; use the deployment adapter already configured for your site, or configure one before rollout. The integration does not silently change your hosting adapter.
- A Workers Node-compatibility deployment must expose server runtime variables through `process.env`. Verify your adapter, `nodejs_compat` setting and compatibility date support that. If the adapter exposes bindings through a separate context, wire that context into `getSupabaseUploadServer` before deploying. Do not expose the secret to client bundles to work around runtime configuration.

No separate Supabase login or Firebase-to-Supabase Auth migration is needed.

## 4. Upload flow and coverage

1. Admin chooses a project image, unit floor-plan image, profile portrait or deal-gallery image.
2. Existing client resizing converts suitable images to WebP at a maximum 2400px long edge; file validation runs first.
3. Browser POSTs metadata and its Firebase ID token to `/api/uploads/sign/`.
4. The server verifies the approved Firebase UID, validates folder/MIME/size, applies a best-effort per-instance quota, and uses the server secret to create a signed upload token for a random object path.
5. Browser sends the file directly to Supabase using its publishable key and the signed token.
6. The returned public image URL is saved in the existing Firestore image field after upload succeeds.

Folders are `projects/{projectId}/{randomId}.{ext}` and `profile/{randomId}.{ext}`. Existing external URLs pasted through JSON are retained as links and are not downloaded or copied to Supabase. All actual file-picker uploads use Supabase. Missing configuration produces an error and does not fall back to Firebase uploads.

Deleting a project removes its records, but images are intentionally retained as they may be referenced elsewhere. Removing an image from a gallery also does not delete the storage object. Review unused files through Supabase separately. A failed Firestore save after a successful image upload may leave an unreferenced object.

## 5. Verification

After deployment sign in with the approved admin account and test a project photo, portrait and deal-gallery photo. Confirm new objects appear in Supabase, their public URLs render, no new files appear in Firebase Storage, and an existing Firebase image still loads. Check non-admin/missing-token requests to `/api/uploads/sign/` fail, SVG/oversized files are rejected, and the secret never appears in browser network responses. Confirm the bucket restrictions in Supabase, including an actual over-limit upload attempt in a test environment.

Automated tests cover folder traversal, metadata limits, signed-upload path generation, SDK request compatibility, error propagation, public image allowlists and CSP configuration. Local builds/tests cannot establish that your remote bucket, Cloudflare environment variables or live credentials are correctly configured.

Official documentation:

- https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl
- https://supabase.com/docs/reference/javascript/storage-from-uploadtosignedurl
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/getting-started/api-keys
- https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/

## Floor plans

Each unit layout has an optional single-image picker. Choose JPG, PNG or WebP up to 5 MB; it uploads on Save project and its URL is saved as `units[].floorPlanUrl`. Existing links (including JSON imports) preview as the selected image. Remove a selected image before choosing a replacement. Removing it clears the saved URL on the next save but does not delete the storage object.
