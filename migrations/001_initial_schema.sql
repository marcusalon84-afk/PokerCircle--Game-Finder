-- PokerCircle Game Finder — PostgreSQL / Supabase Database Migration
-- Version: 001_initial_schema.sql
-- Compatible with Hostinger VPS / PostgreSQL / Supabase

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. ORGANIZERS & CLUBS
CREATE TABLE IF NOT EXISTS organizers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('organizer', 'club')),
  description TEXT,
  city TEXT NOT NULL,
  whatsapp TEXT,
  telegram TEXT,
  phone TEXT,
  website TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. EVENTS (LIVE TOURNAMENTS) WITH MANDATORY PRICE TRANSPARENCY
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL DEFAULT 'live_tournament',
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  estimated_end_date_time TIMESTAMPTZ,
  
  -- Mandatory Price Transparency
  prize_pool_amount NUMERIC(10, 2) NOT NULL,
  house_fee_amount NUMERIC(10, 2) NOT NULL,
  extra_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  extra_fee_description TEXT,
  total_buy_in NUMERIC(10, 2) GENERATED ALWAYS AS (prize_pool_amount + house_fee_amount + extra_fee_amount) STORED,

  -- Structure
  starting_stack INTEGER NOT NULL DEFAULT 50000,
  level_duration INTEGER NOT NULL DEFAULT 15,
  re_entry_terms TEXT NOT NULL,
  description TEXT,

  -- Status & Publication
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'hidden', 'canceled')),
  publication_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  publication_expires_at TIMESTAMPTZ NOT NULL,
  promotion_type TEXT NOT NULL DEFAULT 'regular' CHECK (promotion_type IN ('regular', 'featured', 'sponsored')),
  is_paid_promotion BOOLEAN NOT NULL DEFAULT false,
  paid_amount NUMERIC(10, 2) DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Constraint: If extra_fee_amount > 0, extra_fee_description must not be null or empty
ALTER TABLE events ADD CONSTRAINT check_extra_fee_description 
  CHECK (extra_fee_amount = 0 OR (extra_fee_description IS NOT NULL AND length(trim(extra_fee_description)) > 0));

-- 4. ONLINE CLUBS (CLUBGG SEPARATED TABLE)
CREATE TABLE IF NOT EXISTS online_clubs (
  id TEXT PRIMARY KEY,
  organizer_id TEXT REFERENCES organizers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  clubgg_id TEXT NOT NULL,
  description TEXT,
  join_link TEXT NOT NULL,
  is_pokercircle_club BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  publication_expires_at TIMESTAMPTZ,
  promotion_type TEXT NOT NULL DEFAULT 'regular',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. REVIEWS WITH MODERATION WORKFLOW
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('organizer', 'club')),
  target_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  internal_hide_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  reviewed_at TIMESTAMPTZ,
  
  -- Single review per user per target constraint
  UNIQUE (target_id, user_id)
);

-- 6. INTERACTION TELEMETRY (NO PERSONAL DATA)
CREATE TABLE IF NOT EXISTS interaction_events (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. CONTACT INQUIRIES
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('advertising', 'general')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_events_status_expires ON events(status, publication_expires_at);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date_time);
CREATE INDEX IF NOT EXISTS idx_events_total_buy_in ON events(total_buy_in);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_reviews_target_approved ON reviews(target_id, status);

-- Row Level Security (RLS) Configuration for Supabase
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can view active published events
CREATE POLICY "Public read active events" ON events 
  FOR SELECT USING (status = 'active' AND publication_expires_at > now());

-- Public can view visible organizers
CREATE POLICY "Public read visible organizers" ON organizers 
  FOR SELECT USING (is_visible = true);

-- Public can view active clubs
CREATE POLICY "Public read active clubs" ON online_clubs 
  FOR SELECT USING (status = 'active');

-- Public can view approved reviews only
CREATE POLICY "Public read approved reviews" ON reviews 
  FOR SELECT USING (status = 'approved');
