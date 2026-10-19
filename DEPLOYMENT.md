# Lottery-ay live database setup

The Node/Express app serves the built React website and connects to PostgreSQL.

## Render setup

Create a **Node.js Web Service** for this repository. A Static Site cannot run the API.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables:
  - `NODE_ENV=production`
  - `DATABASE_URL` = PostgreSQL connection string (Render PostgreSQL or Neon)
  - `ADMIN_API_KEY` = a long, unique secret used only by the operator for protected admin API routes

Do not commit database URLs or admin keys to GitHub. On first startup, the service applies `db/schema.sql` and seeds the catalogue rows if they do not already exist. The database user must be allowed to create tables and indexes.

After deployment, verify `https://YOUR-SERVICE-URL/api/health` returns `{"ok":true,"database":"connected"}`. Check `/api/raffles`, `/api/ticket-packages`, and `/api/results` for live database-backed data.

## Live entry endpoints

- `POST /api/entries` — save an entry with `raffleId`, `displayName`, `email`, and `ticketCount` (1–100). Returns a unique entry reference.
- `GET /api/entries/lookup?reference=ENT-...` — retrieve a specific entry by its reference.
- `GET /api/admin/entries` — list recent entries (protected).
- `POST /api/admin/draws` — record a draw for a raffle (protected; one draw per raffle ID).
- `GET /api/results` — list recorded draw results.

Protected endpoints require the header `x-admin-key: YOUR_ADMIN_API_KEY`. Example:

```sh
curl -X POST https://YOUR-SERVICE-URL/api/admin/draws \
  -H 'Content-Type: application/json' \
  -H 'x-admin-key: YOUR_ADMIN_API_KEY' \
  -d '{"raffleId":"grand"}'

curl https://YOUR-SERVICE-URL/api/admin/entries \
  -H 'x-admin-key: YOUR_ADMIN_API_KEY'
```

The draw endpoint weights the selection by each entry's ticket count, updates entry statuses, records the result transactionally, and uses a database lock to prevent concurrent draws for the same raffle. A unique database constraint prevents recording more than one draw for the same raffle ID.

## Important operational limits

This is now a live database-backed entry workflow, but **it is not a complete real-money lottery service**. The form records entries; it does not charge for tickets, verify payments, authenticate participant accounts, validate age/location eligibility, or establish legal eligibility. Catalogue prize values and schedules are seed examples and must be replaced with operator-approved information. Draw code is a basic application implementation, not a certified or independently audited lottery draw. Do not collect payments, advertise guaranteed prizes, or award prizes until the operator has confirmed applicable licensing, official rules, eligibility controls, privacy protections, and draw requirements.

Before opening publicly, add rate limiting and abuse protection, email verification, data retention/privacy terms, operator authentication with proper key rotation, draw closure rules, a reviewed auditable randomness design, and tested database backups. The admin API key must remain private.
