-- House App Seed Data
-- Usage: Run after initial schema migration

-- Plans
INSERT INTO plans (id, code, name, description, price_amount, currency, billing_interval, coupons_per_period) VALUES
  ('11111111-1111-1111-1111-111111111111', 'basic', 'Plan Básico', 'Acceso a 4 sesiones por mes', 9990.00, 'ARS', 'monthly', 4),
  ('22222222-2222-2222-2222-222222222222', 'premium', 'Plan Premium', 'Acceso a 8 sesiones por mes + prioridad', 17990.00, 'ARS', 'monthly', 8),
  ('33333333-3333-3333-3333-333333333333', 'anual', 'Plan Anual', 'Acceso a 6 sesiones por mes, facturación anual', 149990.00, 'ARS', 'yearly', 6)
ON CONFLICT (code) DO NOTHING;

-- Clubs
INSERT INTO clubs (id, name, description, logo_url) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Club Atlético Buenos Aires', 'Centro deportivo premium en Capital Federal con múltiples disciplinas.', NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Padel Zone CABA', 'Especialistas en pádel con canchas de primer nivel.', NULL),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gimnasio Fuerza Total', 'Entrenamiento funcional, pesas y CrossFit.', NULL)
ON CONFLICT (id) DO NOTHING;

-- Club Branches
INSERT INTO club_branches (id, club_id, name, address_line, city, location) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sede Palermo',   'Av. Santa Fe 3500',  'CABA', ST_Point(-58.4100, -34.5895)::geography),
  ('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sede Belgrano',  'Av. Cabildo 2200',   'CABA', ST_Point(-58.4556, -34.5574)::geography),
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Padel Zone Norte', 'Av. del Libertador 12000', 'Vicente López', ST_Point(-58.4800, -34.5200)::geography),
  ('c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sede Centro',     'Av. Corrientes 1800', 'CABA', ST_Point(-58.3876, -34.6042)::geography)
ON CONFLICT (id) DO NOTHING;

-- Club Sports
INSERT INTO club_sports (club_id, sport_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM sports WHERE code = 'futbol')),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM sports WHERE code = 'tenis')),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM sports WHERE code = 'natacion')),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM sports WHERE code = 'padel')),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM sports WHERE code = 'gym'))
ON CONFLICT DO NOTHING;
