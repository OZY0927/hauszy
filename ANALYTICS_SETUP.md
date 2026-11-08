# Admin project dashboard

1. In the Supabase project already configured for Hauszy, open **SQL Editor**, paste `supabase/project-activity.sql` and run it. This creates a daily aggregate table and an atomic counter function. Only the server's service-role key can read or write it; do not add anonymous policies.
2. Deploy the app with the existing `NEXT_PUBLIC_SUPABASE_URL` and encrypted server-only `SUPABASE_SECRET_KEY`. No new secret is required. Never expose the secret with a `NEXT_PUBLIC_` prefix.
3. Open Admin → Dashboard. Choose 7, 30 or 90 days, rank by a metric, or refresh. Only the approved Firebase admin can retrieve the report.
4. To verify collection, accept analytics on the public website, click a project link, open a floor plan, and select a contact button. Refresh the dashboard. Rejected consent produces no analytics request.

Counts start after deployment and table setup. No historical Google Analytics data is imported. Dates use Malaysia time. Totals represent interactions, not unique visitors, leads or completed bookings; repeat visits and bots may affect them. The public collection endpoint validates published project IDs and has a best-effort per-instance rate limit. For stronger abuse controls, configure a Cloudflare WAF rate limit for POST `/api/project-activity/`.

Only project ID, day, metric and count are stored. No visitor IDs, IP addresses, referrers, form contents or messages are stored in this table. Counts are kept until you delete the aggregate rows. Analytics preference controls first-party counts independently of the optional Google tag flag. The existing cookie banner and privacy notice describe both.
