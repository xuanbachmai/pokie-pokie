-- ═══════════════════════════════════════════════════════════════════
--  Vietnam Maze — Supabase schema  (run once in SQL Editor)
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Shared progressive jackpots ──────────────────────────────────
CREATE TABLE IF NOT EXISTS jackpots (
  id         TEXT PRIMARY KEY,
  value      NUMERIC(14, 2) NOT NULL,
  updated_at TIMESTAMPTZ    DEFAULT NOW()
);

INSERT INTO jackpots (id, value)
VALUES ('mega',  5000),
       ('grand', 30000)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION increment_jackpot(jackpot_id TEXT, delta NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql AS $$
DECLARE result NUMERIC;
BEGIN
  UPDATE jackpots SET value = value + delta, updated_at = NOW()
  WHERE id = jackpot_id RETURNING value INTO result;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION win_jackpot(jackpot_id TEXT, seed_value NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql AS $$
DECLARE old_value NUMERIC;
BEGIN
  SELECT value INTO old_value FROM jackpots WHERE id = jackpot_id;
  UPDATE jackpots SET value = seed_value, updated_at = NOW() WHERE id = jackpot_id;
  RETURN old_value;
END; $$;

-- ── 2. Player sessions (anonymous) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Game events ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id         BIGSERIAL PRIMARY KEY,
  session_id TEXT          NOT NULL,
  type       TEXT          NOT NULL,
  amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
  meta       JSONB,
  created_at TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS events_session_idx    ON events (session_id);
CREATE INDEX IF NOT EXISTS events_type_idx       ON events (type);

-- ── 4. Global gamble card history ────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamble_history (
  id         BIGSERIAL PRIMARY KEY,
  suit       TEXT    NOT NULL CHECK (suit  IN ('spades','hearts','diamonds','clubs')),
  value      INTEGER NOT NULL CHECK (value BETWEEN 1 AND 13),
  color      TEXT    NOT NULL CHECK (color IN ('red','black')),
  won        BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trim_gamble_history() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM gamble_history WHERE id NOT IN (SELECT id FROM gamble_history ORDER BY id DESC LIMIT 20);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_trim_gamble_history ON gamble_history;
CREATE TRIGGER trg_trim_gamble_history AFTER INSERT ON gamble_history
FOR EACH ROW EXECUTE FUNCTION trim_gamble_history();

-- ── 5. Aggregation view for /stats dashboard ─────────────────────────
CREATE OR REPLACE VIEW stats_overview WITH (security_invoker = on) AS
SELECT
  (SELECT COUNT(*) FROM sessions)                                           AS total_players,
  (SELECT COUNT(*) FROM sessions WHERE created_at >= NOW()-INTERVAL '24h') AS players_today,
  (SELECT COUNT(*) FROM sessions WHERE created_at >= NOW()-INTERVAL '7d')  AS players_week,
  (SELECT COUNT(*) FROM sessions WHERE created_at >= NOW()-INTERVAL '30m') AS players_live,
  COALESCE((SELECT SUM(amount) FROM events WHERE type='deposit'),0)        AS total_deposited,
  COALESCE((SELECT SUM(amount) FROM events WHERE type='bet'),0)            AS total_wagered,
  COALESCE((SELECT SUM(amount) FROM events WHERE type='win'),0)            AS total_paid_out,
  COALESCE((SELECT COUNT(*)    FROM events WHERE type='bet'),0)            AS total_spins,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='jackpot_win' AND meta->>'tier'='mega'),0)  AS mega_jackpot_wins,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='jackpot_win' AND meta->>'tier'='grand'),0) AS grand_jackpot_wins,
  COALESCE((SELECT MAX(amount) FROM events WHERE type='win'),0)            AS biggest_win,
  COALESCE((SELECT SUM(amount) FROM events WHERE type='deposit' AND created_at>=NOW()-INTERVAL '24h'),0) AS deposited_today,
  COALESCE((SELECT SUM(amount) FROM events WHERE type='bet'     AND created_at>=NOW()-INTERVAL '24h'),0) AS wagered_today,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='feature' AND meta->>'feature'='buffalo_rush'),0) AS buffalo_rush_count,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='feature' AND meta->>'feature'='free_spins'),0)   AS free_spins_count,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='feature' AND meta->>'feature'='tien_len'),0)     AS tien_len_count,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='gamble_win'),0)        AS gamble_wins,
  COALESCE((SELECT COUNT(*) FROM events WHERE type='gamble_loss'),0)       AS gamble_losses;

-- ── 6. Hourly activity view (last 48 h) ──────────────────────────────
CREATE OR REPLACE VIEW hourly_activity WITH (security_invoker = on) AS
SELECT
  DATE_TRUNC('hour', created_at)                                  AS hour,
  COUNT(*) FILTER (WHERE type = 'bet')                            AS spins,
  COALESCE(SUM(amount) FILTER (WHERE type = 'bet'),    0)         AS wagered,
  COALESCE(SUM(amount) FILTER (WHERE type = 'win'),    0)         AS paid_out,
  COALESCE(SUM(amount) FILTER (WHERE type = 'deposit'),0)         AS deposited
FROM events
WHERE created_at >= NOW() - INTERVAL '48 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- ── 7. Row-Level Security ────────────────────────────────────────────
ALTER TABLE jackpots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamble_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts on re-run
DROP POLICY IF EXISTS "public_read_jackpots"   ON jackpots;
DROP POLICY IF EXISTS "public_update_jackpots" ON jackpots;
DROP POLICY IF EXISTS "public_insert_sessions" ON sessions;
DROP POLICY IF EXISTS "public_read_sessions"   ON sessions;
DROP POLICY IF EXISTS "public_insert_events"   ON events;
DROP POLICY IF EXISTS "public_read_events"     ON events;
DROP POLICY IF EXISTS "public_read_gamble"     ON gamble_history;
DROP POLICY IF EXISTS "public_insert_gamble"   ON gamble_history;

CREATE POLICY "public_read_jackpots"   ON jackpots       FOR SELECT USING (true);
CREATE POLICY "public_update_jackpots" ON jackpots       FOR UPDATE USING (true);
CREATE POLICY "public_insert_sessions" ON sessions       FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_sessions"   ON sessions       FOR SELECT USING (true);
CREATE POLICY "public_insert_events"   ON events         FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_events"     ON events         FOR SELECT USING (true);
CREATE POLICY "public_read_gamble"     ON gamble_history FOR SELECT USING (true);
CREATE POLICY "public_insert_gamble"   ON gamble_history FOR INSERT WITH CHECK (true);

-- ── 8. Enable Realtime ───────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE jackpots;
ALTER PUBLICATION supabase_realtime ADD TABLE gamble_history;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
