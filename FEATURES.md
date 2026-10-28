# Hauszy — New launches & developer-direct projects

This website markets new launch projects and units sold directly by developers.

## Implemented UI
- New launch / developer units filters, location, type and indicative starting-price search.
- Project cards with sample unit specifications and saved projects.
- Dedicated project pages with gallery, overview, project details, unit-type section, floor-plan placeholder, facilities, location, purchase journey, project enquiry sidebar and related projects.
- Shareable project URLs and saved projects across pages.
- Terracotta and sand branding; mobile layouts.

## Next production features
- Agent admin backed by Firebase Authentication, Firestore and Storage.
- Project records with developer, tenure, development status, expected completion, unit mix, approved floor plans, brochure and verified facilities.
- Starting prices and available units with clear conditions and last-verified date; no unsupported promotions or availability claims.
- WhatsApp project enquiries, brochure requests and sales gallery appointments.
- Agent REN, agency identity and relevant verified project disclosures.
- Server-rendered project pages on Vercel, unique metadata, canonical URLs, sitemap, appropriate structured data and original area guides for SEO/GEO.

All current records and photos are illustrative. Agent contact details, real developer projects and Firebase integration are pending. Run npm run dev for the UI preview.

## Buyer information hierarchy
Essential information appears first: project identity and developer, location, tenure/title/HDA status, starting price/range/packages, unit sizes/bedrooms/bathrooms/car parks, density (units/towers/floors/units per floor), construction status and estimated VP.

Important supporting sections cover facilities, maintenance and sinking fund, down payment/stamp duty/legal fees/other charges, financing eligibility and instalment assumptions, verified promotions, e-brochure/floor plans/specifications. Optional developer history and evidence-based investment context are expandable near the end. Unknown values remain explicitly unconfirmed; document downloads and financial projections are not fabricated.

## Updated six-section project page
1. Hero: project, location, indicative starting price, tenure, unit size range and latest-price CTA.
2. Unit types and floor plans: sample layout specifications; confirmed multi-key layouts to be added where relevant.
3. Project overview and distinctive facilities.
4. Location and connectivity, with categories for verified landmarks and distances.
5. Pricing and affordability, with maintenance, sinking fund and expandable cost/package details.
6. Enquiry and showroom booking: short preview form, conditional appointment date, brochure availability and WhatsApp preview. No personal information is sent or persisted by this form.

## Current page adjustment
The standalone pricing and affordability section has been removed. Enquiry and showroom booking is now section 5. The hero retains the indicative starting price.

## Current design
Restored the original project information layout: three-image gallery, section navigation, two-column content with sticky enquiry sidebar, overview, concise project facts, unit preview, facilities, location, purchase journey and related projects. Later numbered-section and enquiry-form redesigns have been reverted.

## Current requested project fields
Project name, developer, location, tenure, residential/commercial title, starting price, price range, built-up size, bedrooms, bathrooms, car parks, total units, towers, floors, units per floor, total lifts, estimated VP, construction status, Google Maps area link, nearby landmarks, accessibility, maintenance fee per sqft and sinking fund. Unknown data is explicitly marked as unconfirmed.
