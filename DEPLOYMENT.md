# Lottery-ay backend deployment

The React raffle catalogue now reads from a PostgreSQL-backed API. The server serves the built Vite site and exposes:

- `GET /api/health` — backend/database health
- `GET /api/raffles` — active raffle catalogue
- `GET /api/ticket-packages` — active ticket bundle pricing
- `GET /api/results` — deliberately disabled until an official, verifiable results source is configured

On first startup, the server creates the catalogue tables from `db/schema.sql` and inserts the example catalogue rows only when those IDs do not already exist. Subsequent startups will not overwrite changes made directly in the database.

## Deploy on Render

The existing static-site deployment cannot run this Node/Express API. Create a **Web Service** for this repository (or change the deployment architecture to a Node web service) and configure:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment:** `NODE_ENV=production`
- **Environment:** `DATABASE_URL` = your PostgreSQL connection string (keep this secret; never commit it to GitHub)

Use a PostgreSQL database from Render or a managed provider such as Neon. If your database provider requires SSL, the production server configures PostgreSQL SSL. Ensure the database user can create tables and indexes during initial setup.

Render supplies `PORT` automatically. After deployment, check `https://YOUR-WEB-SERVICE-URL/api/health`; a successful response should contain `{"ok":true,"database":"connected"}`. The raffle section should then display **DATABASE CONNECTED**. If the database is missing/unreachable, the frontend deliberately falls back to labelled preview data.

## Scope and safety

This backend currently manages the published catalogue and sample ticket-price bundles only. It does **not** sell or reserve tickets, accept payments, run random draws, verify winners, or issue payouts. The existing prize values and schedules are illustrative seed data; replace them with operator-approved information before public operation. Do not treat the seeded sample data as a live or licensed raffle.


## Manual backend demonstration

To enable the private demo controls on the Render **Web Service**, set these environment variables:

- `DEMO_MODE=true`
- `DEMO_ADMIN_KEY` = a long, unique secret generated for this demo (keep it private; do not commit it to GitHub)

Redeploy after setting the variables. The public `GET /api/demo/status` endpoint reports whether demo mode is enabled; it never returns the admin key. Admin routes require the header `x-demo-admin-key: YOUR_SECRET`.

### Demonstration endpoints

- `POST /api/demo/entries` — add a simulated participant and 1–100 demo tickets.
- `GET /api/demo/entries` — list recent demo entries; optional `?raffleId=grand`.
- `POST /api/demo/draws` — run a simulated draw for a raffle.
- `GET /api/demo/draws` — list simulated test draws.

Example commands (replace the host and key; do not put a real secret in public chat or source control):

```sh
curl -X POST https://YOUR-WEB-SERVICE/api/demo/entries \
  -H 'Content-Type: application/json' \
  -H 'x-demo-admin-key: YOUR_SECRET' \
  -d '{"raffleId":"grand","displayName":"Demo Player A","ticketCount":5}'

curl -X POST https://YOUR-WEB-SERVICE/api/demo/entries \
  -H 'Content-Type: application/json' \
  -H 'x-demo-admin-key: YOUR_SECRET' \
  -d '{"raffleId":"grand","displayName":"Demo Player B","ticketCount":2}'

curl -X POST https://YOUR-WEB-SERVICE/api/demo/draws \
  -H 'Content-Type: application/json' \
  -H 'x-demo-admin-key: YOUR_SECRET' \
  -d '{"raffleId":"grand"}'

curl https://YOUR-WEB-SERVICE/api/demo/entries -H 'x-demo-admin-key: YOUR_SECRET'
curl https://YOUR-WEB-SERVICE/api/demo/draws -H 'x-demo-admin-key: YOUR_SECRET'
```

The test draw samples among simulated tickets, so an entry with five demo tickets has five times as many chances as an entry with one. Entries and draws are labelled as simulations in the API response and database. The winner selection is only a software demonstration, not a certified random draw. Do not use these endpoints for real ticket sales, prizes, or payouts. Disable demo mode by setting `DEMO_MODE=false` when finished.
