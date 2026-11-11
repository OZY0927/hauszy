# Nearby places on project maps

The location section searches OpenStreetMap independently of the project's saved nearby amenities. No API key is required. The hero and facilities sections are unaffected.

- Food, Schools, Shopping, Healthcare, Transport and Leisure search within 3 km of the published project's saved coordinates.
- Only named places with valid coordinates are shown, with up to 30 nearest places per category. Distances are straight-line estimates, not driving distances or travel times.
- Place pins and the on-map place selector open a name/detail popup. The project pin stays on the map. Project location clears nearby pins; Recenter returns to the project.
- The first category selection loads all six categories in one server request. Subsequent selections reuse that response.
- Projects without coordinates show a location fallback with disabled category controls. The existing saved amenities data is not changed.

## Provider and caching

The server uses https://overpass.private.coffee/api/interpreter. This public Overpass provider permits commercial use without registration: https://overpass.private.coffee/ . OSM attribution remains visible on the map and popups link to the original OSM feature.

Only public project coordinates are sent upstream. Browser coordinates, visitor identifiers and enquiry details are not sent. The request identifies the Hauszy repository in its User-Agent.

Successful, validated results are cached for 24 hours per server process, with bounded memory and coalesced concurrent requests. The API response also permits a 24-hour CDN cache. Serverless cold starts without a CDN cache can repeat a search. At most two searches run concurrently per server process. Failures back off for one minute and are never cached as empty results. No automatic retry loop is used.

The API resolves coordinates from a published project ID and respects its location section visibility. It accepts no arbitrary coordinates, upstream URL, search radius or query text from visitors.

## Validation

`node --test tests/nearby-places.test.js` covers query validation, classification, way centres, invalid/far-away data, deduplication, result limits, partial responses, successful cache expiry, concurrent requests and upstream errors.

Browser interactions were checked using an isolated local proxy with clearly labelled test fixtures (not included in the repository or production app): Food pins, switching to Schools, popup selection, empty Shopping results, one API call for all categories, and a 390 px mobile viewport.

During implementation, live requests to the main Overpass instance returned HTTP 406. Private.coffee requests timed out from the development environment; the app's loading and error states were verified against the real request. Real nearby results still need confirmation when the provider responds. The base OSM map and the project pin loaded successfully.
