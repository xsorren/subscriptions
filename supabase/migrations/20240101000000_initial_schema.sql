-- House App Initial Schema
-- Migration: 20240101000000_initial_schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABLES
-- ============================================

-- Users Profile (extends auth.users)
CREATE TABLE IF NOT EXISTS users_profile (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT,
  phone          TEXT,
  avatar_url     TEXT,
  locale         TEXT NOT NULL DEFAULT 'es',
  timezone       TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles (role-based access control)
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- 'user', 'staff', 'club_admin', 'super_admin'
  name TEXT NOT NULL
);

INSERT INTO roles (code, name) VALUES
  ('user', 'Usuario'),
  ('staff', 'Staff de Club'),
  ('club_admin', 'Administrador de Club'),
  ('super_admin', 'Super Administrador')
ON CONFLICT (code) DO NOTHING;

-- User Roles (m2m)
CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id    INT NOT NULL REFERENCES roles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Sports
CREATE TABLE IF NOT EXISTS sports (
  id   SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

INSERT INTO sports (code, name) VALUES
  ('futbol', 'Fútbol'),
  ('padel', 'Pádel'),
  ('tenis', 'Tenis'),
  ('natacion', 'Natación'),
  ('gym', 'Gimnasio'),
  ('basket', 'Básquet')
ON CONFLICT (code) DO NOTHING;

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  logo_url    TEXT,
  website     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Club Branches (physical locations)
CREATE TABLE IF NOT EXISTS club_branches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  address_line  TEXT NOT NULL,
  city          TEXT NOT NULL,
  state         TEXT,
  country       TEXT NOT NULL DEFAULT 'AR',
  location      geography(POINT, 4326),
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_club_branches_location ON club_branches USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_club_branches_club_id ON club_branches(club_id);

-- Club Sports (m2m)
CREATE TABLE IF NOT EXISTS club_sports (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id  UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  sport_id INT NOT NULL REFERENCES sports(id),
  UNIQUE(club_id, sport_id)
);

-- Club Staff (links users to club branches for authorization)
CREATE TABLE IF NOT EXISTS club_staff (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_branch_id UUID NOT NULL REFERENCES club_branches(id) ON DELETE CASCADE,
  role           TEXT NOT NULL DEFAULT 'staff', -- 'staff', 'manager'
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, club_branch_id)
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  price_amount     NUMERIC(10,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'ARS',
  billing_interval TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  coupons_per_period INT NOT NULL DEFAULT 4,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id    UUID NOT NULL REFERENCES plans(id),
  status     TEXT NOT NULL DEFAULT 'active', -- 'trialing', 'active', 'past_due', 'paused', 'canceled', 'expired'
  starts_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Subscription Periods
CREATE TABLE IF NOT EXISTS subscription_periods (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_period_id UUID REFERENCES subscription_periods(id),
  sport_id               INT REFERENCES sports(id),
  status                 TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'redeemed', 'expired', 'canceled'
  expires_at             TIMESTAMPTZ,
  metadata               JSONB NOT NULL DEFAULT '{}',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);

-- QR Tokens (ephemeral, 2-minute TTL)
CREATE TABLE IF NOT EXISTS qr_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id  UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);

-- Redemptions
CREATE TABLE IF NOT EXISTS redemptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id       UUID NOT NULL REFERENCES coupons(id),
  qr_token_id     UUID REFERENCES qr_tokens(id),
  club_branch_id  UUID NOT NULL REFERENCES club_branches(id),
  redeemed_by     UUID NOT NULL REFERENCES auth.users(id), -- staff who processed it
  idempotency_key TEXT UNIQUE,
  redeemed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id   UUID REFERENCES auth.users(id),
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  UUID,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_user_eligible_club_offers AS
SELECT
  c.user_id,
  c.id AS coupon_id,
  c.sport_id,
  cs.club_id,
  cb.id AS club_branch_id,
  cb.name AS branch_name,
  cb.location,
  cl.name AS club_name
FROM coupons c
JOIN club_sports cs ON cs.sport_id = c.sport_id
JOIN clubs cl ON cl.id = cs.club_id AND cl.is_active = true
JOIN club_branches cb ON cb.club_id = cl.id AND cb.is_active = true
WHERE c.status = 'available';

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION redeem_coupon(
  p_coupon_id       UUID,
  p_qr_token_id     UUID,
  p_club_branch_id  UUID,
  p_redeemed_by     UUID,
  p_idempotency_key TEXT
) RETURNS UUID AS $$
DECLARE
  v_redemption_id UUID;
  v_coupon_status TEXT;
  v_token_valid   BOOLEAN;
BEGIN
  -- Lock the coupon row
  SELECT status INTO v_coupon_status
  FROM coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF v_coupon_status IS NULL THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;

  IF v_coupon_status <> 'available' THEN
    RAISE EXCEPTION 'Coupon is not available (status: %)', v_coupon_status;
  END IF;

  -- Validate QR token
  IF p_qr_token_id IS NOT NULL THEN
    SELECT (expires_at > now() AND is_used = false) INTO v_token_valid
    FROM qr_tokens
    WHERE id = p_qr_token_id AND coupon_id = p_coupon_id;

    IF NOT v_token_valid THEN
      RAISE EXCEPTION 'QR token is invalid or expired';
    END IF;

    UPDATE qr_tokens SET is_used = true WHERE id = p_qr_token_id;
  END IF;

  -- Update coupon status
  UPDATE coupons
  SET status = 'redeemed', updated_at = now()
  WHERE id = p_coupon_id;

  -- Create redemption
  INSERT INTO redemptions (coupon_id, qr_token_id, club_branch_id, redeemed_by, idempotency_key)
  VALUES (p_coupon_id, p_qr_token_id, p_club_branch_id, p_redeemed_by, p_idempotency_key)
  RETURNING id INTO v_redemption_id;

  -- Audit log
  INSERT INTO audit_log (actor_id, action, entity, entity_id, payload)
  VALUES (
    p_redeemed_by,
    'coupon_redeemed',
    'redemptions',
    v_redemption_id,
    jsonb_build_object(
      'coupon_id', p_coupon_id,
      'club_branch_id', p_club_branch_id,
      'qr_token_id', p_qr_token_id
    )
  );

  RETURN v_redemption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY users_profile_self_read ON users_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_profile_self_update ON users_profile FOR UPDATE USING (auth.uid() = id);

-- Users can read their own subscriptions
CREATE POLICY subscriptions_self_read ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own coupons
CREATE POLICY coupons_self_read ON coupons FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own QR tokens (via coupon ownership)
CREATE POLICY qr_tokens_owner_read ON qr_tokens FOR SELECT
  USING (EXISTS (SELECT 1 FROM coupons c WHERE c.id = qr_tokens.coupon_id AND c.user_id = auth.uid()));

-- Staff can read redemptions for their branch
CREATE POLICY redemptions_staff_read ON redemptions FOR SELECT
  USING (
    redeemed_by = auth.uid()
    OR EXISTS (SELECT 1 FROM club_staff cs WHERE cs.user_id = auth.uid() AND cs.club_branch_id = redemptions.club_branch_id)
  );

-- Clubs and branches are public read
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY clubs_public_read ON clubs FOR SELECT USING (true);

ALTER TABLE club_branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY club_branches_public_read ON club_branches FOR SELECT USING (true);

ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY sports_public_read ON sports FOR SELECT USING (true);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plans_public_read ON plans FOR SELECT USING (true);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_profile (id) VALUES (NEW.id);
  INSERT INTO user_roles (user_id, role_id) VALUES (NEW.id, (SELECT id FROM roles WHERE code = 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
