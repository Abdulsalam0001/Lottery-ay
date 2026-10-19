import express from "express";
import crypto from "node:crypto";
import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT) || 10000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const isProduction = process.env.NODE_ENV === "production";
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

const seedRaffles = [
  { id: "grand", name: "The Grand Prize Raffle", prize_amount: 125000, ticket_price: 2, draw_label: "Saturday · 10:00 PM ET", frequency: "Weekly draw", tag: "Featured", description: "Our featured draw with one headline prize and additional cash awards.", sort_order: 1 },
  { id: "community", name: "Community Cash Raffle", prize_amount: 25000, ticket_price: 1, draw_label: "Wednesday · 8:00 PM ET", frequency: "Midweek draw", tag: "Midweek", description: "A smaller weekly raffle with a straightforward entry price.", sort_order: 2 },
  { id: "daily", name: "Daily Bonus Raffle", prize_amount: 5000, ticket_price: 1, draw_label: "Daily · 7:00 PM ET", frequency: "Daily draw", tag: "Daily", description: "A simple daily draw for people who prefer a smaller prize pool.", sort_order: 3 },
];
const seedPackages = [
  { id: "one", quantity: 1, total_price: 2, featured: false, sort_order: 1 },
  { id: "five", quantity: 5, total_price: 9, featured: false, sort_order: 2 },
  { id: "ten", quantity: 10, total_price: 16, featured: true, sort_order: 3 },
  { id: "twenty-five", quantity: 25, total_price: 35, featured: false, sort_order: 4 },
];

async function initialiseDatabase() {
  if (!pool) return;
  const schema = await fs.readFile(path.join(__dirname, "db", "schema.sql"), "utf8");
  await pool.query(schema);
  for (const r of seedRaffles) {
    await pool.query(
      `INSERT INTO raffles (id, name, prize_amount, ticket_price, draw_label, frequency, tag, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [r.id, r.name, r.prize_amount, r.ticket_price, r.draw_label, r.frequency, r.tag, r.description, r.sort_order],
    );
  }
  for (const p of seedPackages) {
    await pool.query(
      `INSERT INTO ticket_packages (id, quantity, total_price, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.quantity, p.total_price, p.featured, p.sort_order],
    );
  }
}

const money = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
const formatRaffle = (r) => ({
  id: r.id,
  name: r.name,
  prize: `$${money(r.prize_amount)}`,
  ticket: `$${money(r.ticket_price)}`,
  draw: r.draw_label,
  frequency: r.frequency,
  tag: r.tag,
  c: r.id === "grand" ? "g1" : r.id === "community" ? "g2" : "g3",
  description: r.description,
});
const formatPackage = (p) => ({
  id: p.id,
  qty: `${p.quantity} ${p.quantity === 1 ? "ticket" : "tickets"}`,
  price: `$${money(p.total_price)}`,
  each: `$${(Number(p.total_price) / Number(p.quantity)).toFixed(2)} per ticket`,
  featured: Boolean(p.featured),
  quantity: Number(p.quantity),
  totalPrice: Number(p.total_price),
});

app.get("/api/health", async (_req, res) => {
  if (!pool) return res.status(503).json({ ok: false, database: "not_configured" });
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.get("/api/raffles", async (_req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  try {
    const { rows } = await pool.query(
      "SELECT id, name, prize_amount, ticket_price, draw_label, frequency, tag, description FROM raffles WHERE active = TRUE ORDER BY sort_order, name",
    );
    res.setHeader("Cache-Control", "no-store");
    res.json(rows.map(formatRaffle));
  } catch (error) { next(error); }
});

app.get("/api/ticket-packages", async (_req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  try {
    const { rows } = await pool.query(
      "SELECT id, quantity, total_price, featured FROM ticket_packages WHERE active = TRUE ORDER BY sort_order, quantity",
    );
    res.setHeader("Cache-Control", "no-store");
    res.json(rows.map(formatPackage));
  } catch (error) { next(error); }
});


function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_API_KEY;
  if (!key || !req.get("x-admin-key") || req.get("x-admin-key") !== key) {
    return res.status(401).json({ error: "Administrator authorization required." });
  }
  next();
}

app.post("/api/entries", async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  const raffleId = typeof req.body?.raffleId === "string" ? req.body.raffleId.trim() : "";
  const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const ticketCount = Number(req.body?.ticketCount);
  if (!raffleId || displayName.length < 2 || displayName.length > 60 ||
      !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) ||
      !Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 100) {
    return res.status(400).json({ error: "Provide a valid raffle, display name, email address, and 1–100 entries." });
  }
  try {
    const raffle = await pool.query("SELECT id FROM raffles WHERE id=$1 AND active=TRUE", [raffleId]);
    if (!raffle.rowCount) return res.status(404).json({ error: "Active raffle not found." });
    const reference = "ENT-" + crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
    const { rows } = await pool.query(
      "INSERT INTO entries (raffle_id, display_name, email, ticket_count, reference) VALUES ($1,$2,$3,$4,$5) RETURNING id, raffle_id AS \"raffleId\", display_name AS \"displayName\", ticket_count AS \"ticketCount\", reference, status, created_at AS \"createdAt\"",
      [raffleId, displayName, email, ticketCount, reference],
    );
    res.status(201).json({ entry: rows[0], message: "Entry saved. This does not confirm payment or eligibility for a paid lottery." });
  } catch (error) { next(error); }
});

app.get("/api/entries/lookup", async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  const reference = typeof req.query.reference === "string" ? req.query.reference.trim() : "";
  if (!/^ENT-[A-F0-9]{12}$/.test(reference)) return res.status(400).json({ error: "Enter a valid entry reference." });
  try {
    const { rows } = await pool.query(
      "SELECT e.reference, e.display_name AS \"displayName\", e.ticket_count AS \"ticketCount\", e.status, e.created_at AS \"createdAt\", r.name AS \"raffleName\" FROM entries e JOIN raffles r ON r.id=e.raffle_id WHERE e.reference=$1",
      [reference],
    );
    if (!rows.length) return res.status(404).json({ error: "No entry found for that reference." });
    res.setHeader("Cache-Control", "no-store");
    res.json({ entry: rows[0] });
  } catch (error) { next(error); }
});

app.get("/api/admin/entries", requireAdmin, async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  try {
    const raffleId = String(req.query.raffleId || "");
    const { rows } = await pool.query(
      `SELECT e.id, e.raffle_id AS "raffleId", r.name AS "raffleName", e.display_name AS "displayName",
              e.email, e.ticket_count AS "ticketCount", e.reference, e.status, e.created_at AS "createdAt"
       FROM entries e JOIN raffles r ON r.id=e.raffle_id
       WHERE ($1 = '' OR e.raffle_id = $1) ORDER BY e.created_at DESC LIMIT 500`,
      [raffleId],
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({ entries: rows });
  } catch (error) { next(error); }
});

app.post("/api/admin/draws", requireAdmin, async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  const raffleId = typeof req.body?.raffleId === "string" ? req.body.raffleId.trim() : "";
  if (!raffleId) return res.status(400).json({ error: "raffleId is required." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [raffleId]);
    const raffle = await client.query("SELECT id FROM raffles WHERE id=$1 AND active=TRUE", [raffleId]);
    if (!raffle.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Active raffle not found." });
    }
    const existing = await client.query("SELECT id FROM raffle_draws WHERE raffle_id=$1", [raffleId]);
    if (existing.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "A draw has already been recorded for this raffle." });
    }
    const counts = await client.query("SELECT COUNT(*)::int AS entries, COALESCE(SUM(ticket_count),0)::int AS tickets FROM entries WHERE raffle_id=$1 AND status='ENTERED'", [raffleId]);
    if (counts.rows[0].tickets < 1) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "No eligible entries exist for this raffle." });
    }
    const selected = await client.query(
      "SELECT e.id, e.display_name, e.ticket_count FROM entries e JOIN LATERAL generate_series(1, e.ticket_count) AS ticket(n) ON TRUE WHERE e.raffle_id=$1 AND e.status='ENTERED' ORDER BY random() LIMIT 1",
      [raffleId],
    );
    const winner = selected.rows[0];
    const reference = "DRAW-" + crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
    await client.query("UPDATE entries SET status='NOT_SELECTED' WHERE raffle_id=$1 AND status='ENTERED'", [raffleId]);
    await client.query("UPDATE entries SET status='SELECTED' WHERE id=$1", [winner.id]);
    const result = await client.query(
      "INSERT INTO raffle_draws (raffle_id, winning_entry_id, winning_display_name, reference, entry_count, ticket_count) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, raffle_id AS \"raffleId\", winning_display_name AS winner, reference, entry_count AS \"entryCount\", ticket_count AS \"ticketCount\", created_at AS \"drawnAt\"",
      [raffleId, winner.id, winner.display_name, reference, counts.rows[0].entries, counts.rows[0].tickets],
    );
    await client.query("COMMIT");
    res.status(201).json({ draw: result.rows[0], notice: "Result recorded in the database. Verify applicable licensing, rules, eligibility, and draw integrity before publishing or awarding any prize." });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally { client.release(); }
});

app.get("/api/results", async (_req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.raffle_id AS "raffleId", r.name AS "raffleName", d.winning_display_name AS winner,
              d.reference, d.entry_count AS "entryCount", d.ticket_count AS "ticketCount", d.created_at AS "drawnAt"
       FROM raffle_draws d JOIN raffles r ON r.id=d.raffle_id ORDER BY d.created_at DESC LIMIT 100`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.json(rows);
  } catch (error) { next(error); }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));

app.use(express.static(distDir, { index: false, maxAge: isProduction ? "1h" : 0 }));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distDir, "index.html"), (error) => { if (error) next(error); });
});

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error?.message || "unknown error");
  if (res.headersSent) return;
  res.status(500).json({ error: "A server error occurred." });
});

async function start() {
  if (pool) {
    try {
      await initialiseDatabase();
      console.log("PostgreSQL connected; raffle catalogue ready.");
    } catch (error) {
      console.error("Database initialization failed:", error.message);
      process.exitCode = 1;
      await pool.end();
      return;
    }
  } else {
    console.warn("DATABASE_URL is not set. API catalogue endpoints will return 503.");
  }
  const server = app.listen(PORT, "0.0.0.0", () => console.log(`Lottery-ay server listening on port ${PORT}`));
  const shutdown = async () => {
    server.close(async () => { if (pool) await pool.end(); process.exit(0); });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start();
