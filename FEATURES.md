# Hauszy features

## Public Next.js pages
- Shared fixed, right-aligned navigation: Explore projects, Tools → Mortgage & Cost Calculator, About Me.
- Server-rendered published projects from Firestore, searchable location suggestions, property type, minimum/maximum price handles with exact amounts, saved-project filters.
- Shareable project routes with metadata, galleries, project facts, unit layouts/floor plans, facilities, maintenance, grouped nearby amenities and automatic km/min units.
- Leaflet/OpenStreetMap map with exact admin-entered coordinates, animated branded pin and recenter controls.
- Compact enquiry card, share/save, WhatsApp placeholder, enquiry/viewing preview forms, project-prefilled loan-calculator link.
- About Me profile and captioned successful-deal photo gallery.
- Mortgage & buying cost calculator (example values, instant results): mortgage, upfront cash and monthly ownership cost; stamp duty by buyer status, property type and date (incl. foreign 8% and first-home exemption checks); SRO 2023 legal fees with HDA scale; per-item quotation overrides, developer cover, timing, paid status and financing; charts, schedule, extra repayments, rate/tenure comparison, progressive interest, WhatsApp summary and print. All rules live in `lib/property-rules.js` with sources and last-verified date.

## Admin
- Firebase email/password sign-in and friendly credential/network errors.
- Manual project editor, custom category/type options, repeatable layouts and nearby amenities, photo picker with cover selection, validation and draft/published/archived status.
- Batched private/published Firestore writes and server readback verification.
- Profile/REN/agency/introduction and profile/deal photo management.
- Explicit offline demo, separate from live Firestore.

## Pending production setup
Actual agent details and WhatsApp contact, live enquiry processing, verified project content, Firebase rules deployment, custom domain metadata/sitemap, and hosting deployment. No rankings, financing approvals or investment returns are guaranteed.
