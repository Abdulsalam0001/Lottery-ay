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


-- Isolated demonstration records. These are never real paid entries.
CREATE TABLE IF NOT EXISTS demo_entries (
  id BIGSERIAL PRIMARY KEY,
  raffle_id TEXT NOT NULL REFERENCES raffles(id),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  ticket_count INTEGER NOT NULL CHECK (ticket_count BETWEEN 1 AND 100),
  demo_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'DEMO_ONLY' CHECK (status IN ('DEMO_ONLY','SELECTED_IN_TEST_DRAW')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_draws (
  id BIGSERIAL PRIMARY KEY,
  raffle_id TEXT NOT NULL REFERENCES raffles(id),
  winning_entry_id BIGINT REFERENCES demo_entries(id),
  winning_display_name TEXT NOT NULL,
  demo_reference TEXT NOT NULL UNIQUE,
  entries_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'SIMULATED' CHECK (status = 'SIMULATED'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_entries_raffle_created_idx ON demo_entries (raffle_id, created_at);
CREATE INDEX IF NOT EXISTS demo_draws_raffle_created_idx ON demo_draws (raffle_id, created_at);


-- Persistent public entries and one recorded draw per raffle.
CREATE TABLE IF NOT EXISTS entries (
  id BIGSERIAL PRIMARY KEY,
  raffle_id TEXT NOT NULL REFERENCES raffles(id),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  ticket_count INTEGER NOT NULL CHECK (ticket_count BETWEEN 1 AND 100),
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ENTERED' CHECK (status IN ('ENTERED','SELECTED','NOT_SELECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raffle_draws (
  id BIGSERIAL PRIMARY KEY,
  raffle_id TEXT NOT NULL UNIQUE REFERENCES raffles(id),
  winning_entry_id BIGINT NOT NULL REFERENCES entries(id),
  winning_display_name TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  entry_count INTEGER NOT NULL CHECK (entry_count > 0),
  ticket_count INTEGER NOT NULL CHECK (ticket_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entries_raffle_status_idx ON entries (raffle_id, status);
CREATE INDEX IF NOT EXISTS entries_created_idx ON entries (created_at DESC);
CREATE INDEX IF NOT EXISTS raffle_draws_created_idx ON raffle_draws (created_at DESC);
