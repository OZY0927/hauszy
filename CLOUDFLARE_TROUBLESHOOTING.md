# CSP and navigation checks — 1 November 2026

The live site at https://www.hauszy.com was checked after reported browser errors.

## Corrected CSP

The security policy omitted services already used by the site:

- Google Fonts stylesheet: `style-src https://fonts.googleapis.com`
- Font files: `font-src https://fonts.gstatic.com`
- Cloudflare Web Analytics script on public pages: `script-src https://static.cloudflareinsights.com`
- Cloudflare beacon endpoint: `connect-src https://cloudflareinsights.com` (automatic same-origin reporting is covered by `'self'`)

These are specific origins, not a wildcard relaxation. Admin pages retain nonce/strict-dynamic script restrictions and now return `Cache-Control: private, no-store, no-transform` so CDN HTML injection should not add an un-nonced beacon there. No new beacon or tracking account is installed by this change. The privacy notice describes Cloudflare hosting metrics separately from optional Google Analytics.

## Reported `_rsc` 503 responses

These are HTTP failures, separate from CSP blocks. During inspection the live About page returned HTML 200, browser navigation from About to Privacy succeeded, and a Privacy RSC request returned 307 to Next.js's normalized RSC URL followed by 200 `text/x-component`. The reported 503 was not reproduced, so no confirmed outage cause is claimed.

Header/footer Links now use `prefetch={false}`. This stops speculative requests for shared navigation/footer destinations, including loading homepage data and its unused hero-image preload while on a project page. Click navigation still uses Next.js normally. This reduces speculative work; it does not repair a failing origin/Worker.

If 503 persists after deployment, inspect the failing request in browser Network tools and Cloudflare Worker/HTTP logs. Record its response body, request headers and CF-Ray. If it has `Sec-Purpose: prefetch`, check Speed Brain: Cloudflare documents that speculative cache misses can return 503 and that those requests do not reach the origin. If ordinary navigation also fails, investigate the deployed application/adapter, resource limits, upstream availability and cache rules instead. Never indiscriminately cache API/admin responses or collapse HTML and RSC into one cache entry.

Cloudflare settings and production code were not changed by this local fix. Deploy the commit before expecting different CSP headers; clear affected cached responses if the old policy remains. If multiple CSP headers are configured, each is enforced and all must permit the intended assets.

Sources:

- https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/
- https://developers.cloudflare.com/web-analytics/faq/
- https://developers.cloudflare.com/speed/optimization/content/speed-brain/
