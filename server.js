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


const demoModeEnabled = () => process.env.DEMO_MODE === "true";
function requireDemoAdmin(req, res, next) {
  const configuredKey = process.env.DEMO_ADMIN_KEY;
  if (!demoModeEnabled()) return res.status(404).json({ error: "Demo tools are disabled." });
  if (!configuredKey || !req.get("x-demo-admin-key") || req.get("x-demo-admin-key") !== configuredKey) {
    return res.status(401).json({ error: "A valid demo admin key is required." });
  }
  next();
}

app.get("/api/demo/status", (_req, res) => {
  res.json({ enabled: demoModeEnabled(), realMoney: false, label: "SIMULATION ONLY" });
});

app.get("/api/demo/entries", requireDemoAdmin, async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  try {
    const raffleId = String(req.query.raffleId || "");
    const { rows } = await pool.query(
      `SELECT e.id, e.raffle_id AS "raffleId", r.name AS "raffleName", e.display_name AS "displayName",
              e.ticket_count AS "ticketCount", e.demo_reference AS "reference", e.status, e.created_at AS "createdAt"
       FROM demo_entries e JOIN raffles r ON r.id=e.raffle_id
       WHERE ($1 = '' OR e.raffle_id = $1) ORDER BY e.created_at DESC LIMIT 250`,
      [raffleId],
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({ simulationOnly: true, entries: rows });
  } catch (error) { next(error); }
});

app.post("/api/demo/entries", requireDemoAdmin, async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  const raffleId = typeof req.body?.raffleId === "string" ? req.body.raffleId.trim() : "";
  const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
  const ticketCount = Number(req.body?.ticketCount);
  if (!raffleId || displayName.length < 2 || displayName.length > 60 ||
      !Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 100) {
    return res.status(400).json({ error: "Provide a raffleId, a 2–60 character displayName, and ticketCount from 1 to 100." });
  }
  try {
    const raffle = await pool.query("SELECT id FROM raffles WHERE id=$1 AND active=TRUE", [raffleId]);
    if (!raffle.rowCount) return res.status(404).json({ error: "Active raffle not found." });
    const reference = "DEMO-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const { rows } = await pool.query(
      "INSERT INTO demo_entries (raffle_id, display_name, ticket_count, demo_reference) VALUES ($1,$2,$3,$4) RETURNING id, raffle_id AS \"raffleId\", display_name AS \"displayName\", ticket_count AS \"ticketCount\", demo_reference AS reference, status, created_at AS \"createdAt\"",
      [raffleId, displayName, ticketCount, reference],
    );
    res.status(201).json({ simulationOnly: true, entry: rows[0] });
  } catch (error) { next(error); }
});

app.post("/api/demo/draws", requireDemoAdmin, async (req, res, next) => {
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
    const counts = await client.query("SELECT COUNT(*)::int AS entries, COALESCE(SUM(ticket_count),0)::int AS tickets FROM demo_entries WHERE raffle_id=$1 AND status='DEMO_ONLY'", [raffleId]);
    if (counts.rows[0].entries < 1) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Add at least one demo entry before running a test draw." });
    }
    const winnerResult = await client.query(
      "SELECT id, display_name, ticket_count FROM demo_entries WHERE raffle_id=$1 AND status='DEMO_ONLY' ORDER BY random() LIMIT 1 FOR UPDATE",
      [raffleId],
    );
    const winner = winnerResult.rows[0];
    const reference = "TEST-DRAW-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    await client.query("UPDATE demo_entries SET status='SELECTED_IN_TEST_DRAW' WHERE id=$1", [winner.id]);
    const draw = await client.query(
      "INSERT INTO demo_draws (raffle_id, winning_entry_id, winning_display_name, demo_reference, entries_count) VALUES ($1,$2,$3,$4,$5) RETURNING id, raffle_id AS \"raffleId\", winning_display_name AS \"winner\", demo_reference AS reference, entries_count AS \"entriesCount\", status, created_at AS \"createdAt\"",
      [raffleId, winner.id, winner.display_name, reference, counts.rows[0].entries],
    );
    await client.query("COMMIT");
    res.status(201).json({ simulationOnly: true, notice: "SIMULATED TEST RESULT — NOT A REAL DRAW OR WINNER ANNOUNCEMENT", draw: draw.rows[0], eligibleDemoEntries: counts.rows[0].entries, demoTickets: counts.rows[0].tickets });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally { client.release(); }
});

app.get("/api/demo/draws", requireDemoAdmin, async (req, res, next) => {
  if (!pool) return res.status(503).json({ error: "Database is not configured." });
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.raffle_id AS "raffleId", r.name AS "raffleName", d.winning_display_name AS winner,
              d.demo_reference AS reference, d.entries_count AS "entriesCount", d.status, d.created_at AS "createdAt"
       FROM demo_draws d JOIN raffles r ON r.id=d.raffle_id ORDER BY d.created_at DESC LIMIT 100`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({ simulationOnly: true, draws: rows });
  } catch (error) { next(error); }
});

app.get("/api/results", async (_req, res) => {
  res.status(501).json({ error: "Verified draw results are not enabled. No results are being represented as official." });
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
