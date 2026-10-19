-- Lottery-ay catalogue schema.
-- This stores published raffle catalogue/pricing only; it does not process entries or payouts.
CREATE TABLE IF NOT EXISTS raffles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prize_amount NUMERIC(14, 2) NOT NULL CHECK (prize_amount >= 0),
  ticket_price NUMERIC(10, 2) NOT NULL CHECK (ticket_price >= 0),
  draw_label TEXT NOT NULL,
  frequency TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Raffle',
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_packages (
  id TEXT PRIMARY KEY,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS raffles_active_sort_idx ON raffles (active, sort_order);
CREATE INDEX IF NOT EXISTS ticket_packages_active_sort_idx ON ticket_packages (active, sort_order);
