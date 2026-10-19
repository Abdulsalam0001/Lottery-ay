import express from "express";
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

app.get("/api/results", async (_req, res) => {
  res.status(501).json({ error: "Verified draw results are not enabled. No results are being represented as official." });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));

app.use(express.static(distDir, { index: false, maxAge: isProduction ? "1h" : 0 }));
app.get("*", (req, res, next) => {
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
