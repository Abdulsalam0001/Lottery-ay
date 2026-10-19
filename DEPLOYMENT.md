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
