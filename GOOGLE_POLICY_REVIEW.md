# Google Ads, analytics and search review

Reviewed 1 November 2026. Scope: repository code, Google's official policy/documentation pages, and a read-only snapshot of all 80 records in `publicProjects` plus the public About Me profile. No Google Ads/Analytics/Search Console account was connected. Changes are local, not deployed. This is a practical website review, not a Google approval decision or a certification of legal compliance.

## Findings and changes

| Area | Evidence and response |
| --- | --- |
| Misrepresentation / business identity | Public profile provides Joel Ooi Zheng Yee, phone and email but no REN or agency. Removed the unconditional Real Estate Negotiator label and the unverified developer-direct wording. Project developers remain individually attributed. Add actual credentials and agency details after verifying them; do not imply affiliation or authorization without evidence. |
| Unsupported return claims | Removed an unsourced “around 5%” Malaysia average rental-yield statement. Changed “real return” to “estimated return”; added an explicit no-guaranteed-income/occupancy/return statement. Existing loan/DSR calculations already explain assumptions and distinguish estimates from bank approval. No calculator formulas were altered. |
| Unavailable / unapproved offers | Four published records explicitly say to retain archived (listed below). Added a conservative public-page/sitemap exclusion and an admin warning/publish guard for explicit archive instructions. This does not change Firebase records or make the public collection private. Admins must archive those records in the database until underlying restrictions are resolved; pause any ads pointing at excluded URLs. Other approval qualifications require human verification. |
| Images and original content | All 80 published records currently have empty image arrays. This alone is not proof of a violation. Retained honest placeholders and labelled the homepage stock interior as illustrative. Replace placeholders with authorized project media and useful original descriptions. No invented project photos or reviews were added. |
| Data collection | Added a privacy notice describing WhatsApp handling, browser storage, calculators, Firebase, external media/maps and optional analytics; linked it beside enquiry submission and in the footer. Changed personal-data forms to POST so a JavaScript failure cannot put passwords or enquiry details into a GET query string. |
| Google tag | Wired the existing Firebase GA4 measurement ID G-K8BKKWHX2Z through a consent-controlled Google tag. The tag remains inactive until `NEXT_PUBLIC_ANALYTICS_ENABLED=true` is set after the GA4 configuration review; no tag download before consent. Advertising consent stays denied; Google signals/personalization disabled. Explicit events use allowlisted public paths, generic titles, no query parameters/referrer, and no form/calculator values. Admin paths are excluded. Revocation disables the tag and attempts first-party analytics cookie deletion. The implementation does not add Google Ads conversion tracking or create an Ads account. |
| Crawlability / SEO | Added per-page titles/descriptions/social metadata; canonical URLs, a dynamic published-project sitemap, robots rules and truthful WebSite/project/breadcrumb structured data when the primary origin is configured. Admin retains noindex. Robots allows crawling admin's noindex rather than blocking the crawler from reading it; authentication remains the access control. JSON-LD escapes `<` to prevent script breakout from imported content. |
| AI search / GEO | Google's AI search guidance uses the same crawlability, indexing and helpful-content foundations. No special AI markup or inclusion guarantee. Added visible disclosures and matching structured facts; did not create fake FAQ, review, location, inventory or rating claims. |

## Records requiring immediate editorial review

Explicit archive instructions were found in the public records for:

- Penang Technology Park @ Bertam
- Puncak City @ Juru South – Terrace Shop Offices
- Puncak City @ Juru South – Semi-D Shop Offices
- Puncak City @ Juru South – Light Industry

Additional advertising-permission qualifications occur in Muze @ PICC, Menara VOS (Commercial Suites), and Maris – Andaman Island. Verify current developer authorization before advertising them. Records also contain affordable-housing eligibility conditions and historic price/package qualifications; do not remove these simply to make ads look cleaner. Confirm current availability, restrictions and final pricing against authorized developer documentation. Many records use the sinking-fund field for long source/editorial notes: move internal working notes out of published records and present material buyer conditions in clear, appropriately labelled sections during future content cleanup.

## Deployment and account steps

1. Set `NEXT_PUBLIC_SITE_URL` to the confirmed primary HTTPS origin before building/deploying. No domain is invented. Without this variable canonical URLs/JSON-LD are omitted and the sitemap is empty. `.env.example` documents configuration. Make the live site accessible over HTTPS and check AdsBot can fetch the exact ad landing URLs; local builds cannot establish live uptime/crawlability.
2. Confirm that G-K8BKKWHX2Z is the intended GA4 property. In GA4 Admin → Data streams → web stream → Enhanced measurement, disable enhanced measurement (especially history-based page changes, form interactions and outbound clicks). This implementation sends manual pageviews; account-side automatic measurement can duplicate them and can capture outbound WhatsApp links. Confirm this before setting `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and rebuilding for production. Keep Google signals/advertising integrations disabled unless separately reviewed and disclosed. Check tag and collection behavior with Tag Assistant and GA4 Realtime, using test traffic rather than real enquiry details.
3. If Search Console is not verified, add the primary domain via DNS or set `GOOGLE_SITE_VERIFICATION` to its supplied HTML token. Submit `/sitemap.xml` and inspect representative project/tool URLs. A GA4 tag is not a ranking factor or an indexing submission.
4. Archive the four held Firebase records and check current authorizations for the three additional listings. The code does not grant advertising permission or erase existing public documents. Once the underlying issue is resolved, correct the notes before republishing. Configure agency/REN and contact details truthfully in About Me.
5. Google Ads advertiser verification, billing identity, ad text, targeting, destinations and account history must be reviewed in Google Ads. Financial-services verification may apply in Malaysia when advertising financial services or targeting financial-services intent, even to a non-financial provider. The calculators do not establish an exemption. Housing personalization restrictions on age, gender, marital/parental status and ZIP targeting apply to the US/Canada; do not incorrectly treat them as universal Malaysia targeting requirements. Avoid targeting based on personal hardship or sensitive financial data.
6. If Ads conversion measurement is desired, supply the real Ads tag/conversion destination and define a confirmed success action. Opening a WhatsApp draft is not proof of a sent message, booked viewing or completed sale. No fake conversion IDs or lead counts were introduced.

## Official sources reviewed

- Misrepresentation: https://support.google.com/adspolicy/answer/6020955?hl=en
- Destination requirements: https://support.google.com/adspolicy/answer/6368661?hl=en
- Data collection and use: https://support.google.com/adspolicy/answer/6020956?hl=en
- Housing personalization: https://support.google.com/adspolicy/answer/9997418?hl=en
- Restricted targeting: https://support.google.com/adspolicy/answer/143465
- Malaysia financial-services verification: https://support.google.com/adspolicy/answer/15332527?co=GENIE.CountryCode%3DMY&hl=en
- Analytics privacy disclosure: https://support.google.com/analytics/answer/7318509?hl=en
- Consent mode implementation: https://developers.google.com/tag-platform/security/guides/consent
- Manual pageviews and enhanced measurement: https://developers.google.com/analytics/devguides/collection/ga4/views
- AI features and websites: https://developers.google.com/search/docs/appearance/ai-features
- Organization markup: https://developers.google.com/search/docs/appearance/structured-data/organization
- Breadcrumb markup: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies

## Validation

Automated tests cover existing functionality, origin/canonical generation, truthful geo/breadcrumb data, JSON-LD escaping, analytics path exclusion and explicit publication holds. Production build completed successfully. Local browser review covered privacy layout and rejecting analytics. Live Google account configuration, campaign approval, Search Console submission, certificate/AdsBot access and developer authorizations require the actual production domain and appropriate account access.
