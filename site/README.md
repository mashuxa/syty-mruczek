# Syty Kotek

Domowe obiady dla ekip w Pruszkowie i do 5 km od miasta. Polish, Russian and Ukrainian lead form; no online payment. Delivery, menu and price require individual confirmation.

## Run

Node.js 22. `npm ci`, copy `.env.example` to `.env.local`, configure server variables, then `npm run dev`.

`npm run build` creates a Next.js standalone package including public assets. `npm start` runs it. `npm test` validates form boundaries.

## Storage

The server route `/api/leads` validates requests and relays them to the Supabase function `restaurant-leads-v1`. The dedicated private `restaurant` schema contains leads and durable rate limits. RLS is enabled and anonymous/authenticated Data API roles have no access. No database key or relay token is sent to the browser.

`database/schema.sql` is the initial schema snapshot, already applied to the selected project. Do not rerun it on that database. Edge function sources are in `supabase/functions/restaurant-leads-v1`. Its token configuration stores only a SHA-256 hash. Keep the schema outside Data API exposed schemas.

Retries with the same request ID and payload return the same lead. A changed payload with that ID returns 409. Limits: 60 new requests per network per hour and 5 per contact per hour. Outside Vercel, configure a trusted reverse proxy before setting `TRUST_PROXY=1`; otherwise the network limit is shared by the server.

## Vercel

Connect this repository through the Git integration. Root Directory: `site`. Framework: Next.js. Configure `RESTAURANT_FUNCTION_URL`, the secret `RESTAURANT_RELAY_TOKEN`, and `APP_ORIGIN` (the production origin). Vercel preview and production system URLs are also accepted by the route.

The production branch is `codex/launch`; every push to it deploys automatically. Other branches receive previews. No GitHub Actions deployment token is required. Production builds run input-validation tests before compiling Next.js.

Email notifications are intentionally a placeholder: submissions are stored in the database, but no email is sent. `notification_status=placeholder` records this explicitly. Add the recipient/provider later.

## Public pages and branding

Production: https://syty-kotek.vercel.app. The previous syty-mruczek.vercel.app address permanently redirects to it. Polish `/`, Russian `/ru`, Ukrainian `/uk`; language links save the preference in localStorage. Public pages include localized metadata, canonical/hreflang links, robots.txt, sitemap and service structured data. Preview deployments and admin pages are excluded from indexing. Social previews use `/social-card-v1.png`; the favicon is a paw with a spoon.

The responsive gallery has 10 slides cycling through three supplied food photos until more examples are available. It supports touch scrolling, arrows and keyboard controls. On small screens a fixed bottom button opens the form, then submits it while the form is visible.

## Admin and visit counts

`/superuser/login` checks the server-only `RESTAURANT_ADMIN_PASSWORD_HASH` (scrypt). Configure it locally with `scripts/set-admin-password.mjs` using stdin and store only the resulting hash as a Vercel Production secret. Signed admin sessions expire after 12 hours and use HttpOnly, Secure, SameSite=Strict cookies. Durable login rate limits apply. `/superuser/` lists newest leads first, 20 per page. Test entries are marked explicitly.

`database/admin-and-visits.sql` is the already-applied extension for private daily visit records and admin login limits. `restaurant-app-v1` is the authenticated server relay for listing leads and recording visits. Never call this function from browser code or expose its relay token.

Visits are approximate daily unique IP/browser combinations, stored as a daily HMAC without raw IP addresses or analytics cookies. Known bot user agents, prefetches and automated browser sessions are excluded. Seven-day counts sum daily uniques. Analytics failures never prevent form submission. Google Analytics is pending a supplied GA4 Measurement ID.

Never commit `.env.local`, `.vercel`, database credentials or customer records. The cat logo is an original generated brand draft.
