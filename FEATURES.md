# Hauszy features

## Public Next.js pages
- Shared fixed, right-aligned navigation: Explore projects, Tools → Loan Calculator, About Me.
- Server-rendered published projects from Firestore, searchable location suggestions, property type, minimum/maximum price handles with exact amounts, saved-project filters, sorting (newest, price, price per sqft, completion) and a side-by-side comparison of saved projects.
- Shareable project routes with metadata, galleries, project facts, unit layouts/floor plans, facilities, maintenance, grouped nearby amenities and automatic km/min units.
- Leaflet/OpenStreetMap map with exact admin-entered coordinates, animated branded pin and recenter controls.
- Compact enquiry card, share/save, WhatsApp placeholder, enquiry/viewing preview forms, project-prefilled loan-calculator link.
- About Me profile and captioned successful-deal photo gallery.
- Monthly instalment calculator: down payment as % or RM, total interest, total repayment and property cost, principal vs interest split and loan insights.

## Admin
- Firebase email/password sign-in and friendly credential/network errors.
- Manual project editor, custom category/type options, repeatable layouts and nearby amenities, photo picker with cover selection, validation and draft/published/archived status.
- Batched private/published Firestore writes and server readback verification.
- Profile/REN/agency/introduction and profile/deal photo management.

## Pending production setup
Actual agent details and WhatsApp contact, live enquiry processing, verified project content, Firebase rules deployment, custom domain metadata/sitemap, and hosting deployment. No rankings, financing approvals or investment returns are guaranteed.
- Motion & icons: inline SVG icon set (`components/Icon.js`, facility icons matched by name), scroll-reveal for sections and cards (`components/Motion.js`), CSS entrance animations for page headings, hover/press micro-interactions, animated dropdown, dialogs and loader; all motion is disabled under "reduce motion".
- Footer: brand intro, social media icons, Explore and Tools links, agent contact (phone, WhatsApp, email, service area), disclaimer and back-to-top. Contact details and social links are edited in Admin → About me and stored on `siteContent/about`.
- ROI Calculator (`/tools/roi-calculator`): gross and net rental yield, monthly cash flow, return on cash invested and break-even rent.
- Phone fields (enquiry form, admin phone and WhatsApp): searchable country-code picker with every country plus the local number on one row; stored as E.164 and validated per country (`components/PhoneInput.js`, `lib/phone.js`).
