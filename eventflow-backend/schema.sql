-- ============================================================
-- EVENTFLOW DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- Project: https://thhujoitazdzvazfahdz.supabase.co
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: clubs
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  logo_url        TEXT,
  college         TEXT,
  phone           TEXT,
  smtp_host       TEXT,
  smtp_port       INTEGER DEFAULT 587,
  smtp_user       TEXT,
  smtp_pass       TEXT,
  smtp_from_name  TEXT,
  smtp_from_email TEXT,
  plan            TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro' | 'institution'
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  venue           TEXT,
  event_date      TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  banner_url      TEXT,
  theme_color     TEXT DEFAULT '#6366f1',
  capacity        INTEGER,
  entry_fee       INTEGER DEFAULT 0,
  form_fields     JSONB NOT NULL DEFAULT '[]',
  -- form_fields shape: [{ id, label, type, required, options? }]
  status          TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published' | 'closed' | 'completed'
  slug            TEXT UNIQUE,
  plan_required   TEXT DEFAULT 'free',            -- which plan unlocks this event
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  form_data       JSONB NOT NULL DEFAULT '{}',
  -- form_data shape: { fieldId: value, ... }
  attendee_name   TEXT,    -- extracted from form_data for quick display
  attendee_email  TEXT,    -- extracted from form_data for email delivery
  payment_screenshot_url TEXT,
  payment_status  TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'free'
  status          TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  approved_at     TIMESTAMPTZ,
  approved_by     UUID,   -- references volunteers(id), added as FK after volunteers table
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: qr_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id  UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
  event_id         UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token            TEXT NOT NULL UNIQUE,   -- signed JWT payload
  qr_image_url     TEXT,                  -- stored in Supabase Storage
  email_sent       BOOLEAN DEFAULT FALSE,
  email_sent_at    TIMESTAMPTZ,
  scanned_at       TIMESTAMPTZ,           -- NULL = not yet scanned, non-NULL = already used
  scanned_by       UUID,                  -- volunteer id
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: volunteers
-- ============================================================
CREATE TABLE IF NOT EXISTS volunteers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,  -- NULL = club-wide volunteer
  name        TEXT NOT NULL,
  access_code TEXT NOT NULL,    -- simple code they type to log in, e.g. "TECH24-VOL"
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: scan_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id      UUID NOT NULL REFERENCES qr_codes(id),
  event_id        UUID NOT NULL REFERENCES events(id),
  registration_id UUID NOT NULL REFERENCES registrations(id),
  volunteer_id    UUID REFERENCES volunteers(id),
  result          TEXT NOT NULL,   -- 'success' | 'already_scanned' | 'invalid' | 'rejected'
  scanned_at      TIMESTAMPTZ DEFAULT NOW(),
  device_info     TEXT
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_club_id       ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_slug           ON events(slug);
CREATE INDEX IF NOT EXISTS idx_registrations_event   ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email   ON registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_registrations_status  ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token        ON qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_qr_codes_registration ON qr_codes(registration_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_event       ON scan_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_code       ON volunteers(access_code);

-- ============================================================
-- ROW LEVEL SECURITY
-- We use service_role key in the backend so RLS is bypassed
-- at the API layer. These policies protect direct DB access.
-- ============================================================
ALTER TABLE clubs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs     ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically (our backend uses this)
-- These policies are for safety if anon key is ever used directly

CREATE POLICY "No anon access to clubs"         ON clubs         FOR ALL USING (FALSE);
CREATE POLICY "No anon access to registrations" ON registrations FOR ALL USING (FALSE);
CREATE POLICY "No anon access to qr_codes"      ON qr_codes      FOR ALL USING (FALSE);
CREATE POLICY "No anon access to volunteers"    ON volunteers    FOR ALL USING (FALSE);
CREATE POLICY "No anon access to scan_logs"     ON scan_logs     FOR ALL USING (FALSE);

-- Events are publicly readable when published (for registration page)
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status = 'published');

-- ============================================================
-- SUPABASE STORAGE BUCKET for uploads
-- Run these after creating the schema
-- ============================================================
-- In Supabase Dashboard → Storage → Create bucket:
--   Name: eventflow-uploads
--   Public: true
-- (We'll automate this via the backend on first run)

-- ============================================================
-- UPDATED_AT trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
