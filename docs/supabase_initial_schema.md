# Script inicial de base de datos (Supabase) para app de suscripciones deportivas

Este documento incluye un **script SQL inicial** orientado a un MVP robusto y escalable en Supabase, contemplando:

- autenticación y perfilado de usuario,
- roles y acceso para app/panel,
- clubes/sedes/ofertas,
- planes/suscripciones,
- cupones/canje QR,
- mapa y descubrimiento por elegibilidad,
- auditoría y seguridad base con RLS.

> Ejecutar desde SQL Editor de Supabase o como migración (`supabase migrations`).

---

## 1) SQL inicial

```sql
-- =========================================================
-- Supabase initial schema - subscriptions app
-- =========================================================

-- Extensiones útiles
create extension if not exists pgcrypto;
create extension if not exists postgis;

-- ---------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------
create schema if not exists app;

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------
-- Usuarios y autenticación (perfil app + roles)
-- ---------------------------------------------------------
create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  locale text default 'es-AR',
  timezone text default 'America/Argentina/Buenos_Aires',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_users_profile_updated_at
before update on public.users_profile
for each row execute function app.touch_updated_at();

create table if not exists public.roles (
  id bigserial primary key,
  code text unique not null, -- admin, ops, club_owner, club_staff, customer
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role_id)
);

insert into public.roles (code, description)
values
  ('admin', 'Administrador global'),
  ('ops', 'Operaciones internas'),
  ('club_owner', 'Dueño/Gestor de club'),
  ('club_staff', 'Staff de sede/recepción'),
  ('customer', 'Usuario final de la app')
on conflict (code) do nothing;

-- Al registrarse un usuario en auth.users se crea perfil y rol customer
create or replace function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id bigint;
begin
  insert into public.users_profile (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;

  select id into customer_role_id from public.roles where code = 'customer';

  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure app.handle_new_auth_user();

-- ---------------------------------------------------------
-- Catálogo de deportes y clubes (incluye mapa)
-- ---------------------------------------------------------
create table if not exists public.sports (
  id bigserial primary key,
  code text unique not null, -- padel, gym, swimming
  name text not null,
  icon_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_clubs_updated_at
before update on public.clubs
for each row execute function app.touch_updated_at();

create table if not exists public.club_branches (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  address_line text not null,
  city text not null,
  state text,
  country text not null default 'AR',
  postal_code text,
  location geography(point, 4326) not null,
  timezone text default 'America/Argentina/Buenos_Aires',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_club_branches_location
  on public.club_branches using gist(location);

create index if not exists idx_club_branches_club_id
  on public.club_branches(club_id);

create trigger trg_club_branches_updated_at
before update on public.club_branches
for each row execute function app.touch_updated_at();

create table if not exists public.club_sport_offerings (
  id uuid primary key default gen_random_uuid(),
  club_branch_id uuid not null references public.club_branches(id) on delete cascade,
  sport_id bigint not null references public.sports(id),
  service_name text not null,
  session_minutes int not null check (session_minutes > 0),
  redeem_rules jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (club_branch_id, sport_id, service_name)
);

-- ---------------------------------------------------------
-- Planes, suscripciones y periodos
-- ---------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  price_amount numeric(12,2) not null check (price_amount >= 0),
  currency text not null default 'ARS',
  billing_interval text not null check (billing_interval in ('monthly', 'yearly')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_plans_updated_at
before update on public.plans
for each row execute function app.touch_updated_at();

create table if not exists public.plan_benefits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  sport_id bigint not null references public.sports(id),
  coupons_per_period int not null check (coupons_per_period >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (plan_id, sport_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null check (status in ('trialing', 'active', 'past_due', 'paused', 'canceled', 'expired')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  canceled_at timestamptz,
  external_customer_id text,
  external_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_subscriptions_user_status
  on public.subscriptions(user_id, status);

create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function app.touch_updated_at();

create table if not exists public.subscription_periods (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  status text not null check (status in ('open', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (subscription_id, period_start, period_end)
);

-- ---------------------------------------------------------
-- Cupones y canjes QR
-- ---------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_period_id uuid not null references public.subscription_periods(id) on delete cascade,
  sport_id bigint not null references public.sports(id),
  status text not null check (status in ('available', 'reserved', 'redeemed', 'expired', 'canceled')),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_coupons_user_status_exp
  on public.coupons(user_id, status, expires_at);

create trigger trg_coupons_updated_at
before update on public.coupons
for each row execute function app.touch_updated_at();

create table if not exists public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  nonce text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_qr_tokens_expires_used
  on public.qr_tokens(expires_at, used_at);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  qr_token_id uuid references public.qr_tokens(id) on delete set null,
  club_branch_id uuid not null references public.club_branches(id),
  staff_user_id uuid references auth.users(id),
  redeemed_at timestamptz not null default timezone('utc', now()),
  idempotency_key text,
  device_info jsonb not null default '{}'::jsonb,
  notes text
);

create unique index if not exists uq_coupon_redemptions_coupon
  on public.coupon_redemptions(coupon_id);

create index if not exists idx_coupon_redemptions_branch_date
  on public.coupon_redemptions(club_branch_id, redeemed_at desc);

-- ---------------------------------------------------------
-- Relación staff <-> sedes
-- ---------------------------------------------------------
create table if not exists public.club_staff_assignments (
  user_id uuid not null references auth.users(id) on delete cascade,
  club_branch_id uuid not null references public.club_branches(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, club_branch_id)
);

-- ---------------------------------------------------------
-- Auditoría
-- ---------------------------------------------------------
create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_name text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_audit_logs_created_at
  on public.audit_logs(created_at desc);

-- ---------------------------------------------------------
-- Funciones de negocio clave
-- ---------------------------------------------------------

-- 1) Canje atómico (evita doble canje)
create or replace function public.redeem_coupon(
  p_qr_nonce text,
  p_club_branch_id uuid,
  p_staff_user_id uuid,
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr public.qr_tokens%rowtype;
  v_coupon public.coupons%rowtype;
  v_redemption_id uuid;
begin
  select * into v_qr
  from public.qr_tokens
  where nonce = p_qr_nonce
  for update;

  if not found then
    raise exception 'QR token inválido';
  end if;

  if v_qr.used_at is not null then
    raise exception 'QR token ya utilizado';
  end if;

  if v_qr.expires_at < timezone('utc', now()) then
    raise exception 'QR token expirado';
  end if;

  select * into v_coupon
  from public.coupons
  where id = v_qr.coupon_id
  for update;

  if v_coupon.status <> 'available' then
    raise exception 'Cupón no disponible para canje';
  end if;

  update public.coupons
  set status = 'redeemed', updated_at = timezone('utc', now())
  where id = v_coupon.id;

  update public.qr_tokens
  set used_at = timezone('utc', now())
  where id = v_qr.id;

  insert into public.coupon_redemptions (
    coupon_id,
    qr_token_id,
    club_branch_id,
    staff_user_id,
    idempotency_key
  )
  values (
    v_coupon.id,
    v_qr.id,
    p_club_branch_id,
    p_staff_user_id,
    p_idempotency_key
  )
  returning id into v_redemption_id;

  insert into public.audit_logs (actor_user_id, action, entity_name, entity_id, payload)
  values (
    p_staff_user_id,
    'coupon_redeemed',
    'coupon',
    v_coupon.id::text,
    jsonb_build_object('club_branch_id', p_club_branch_id, 'redemption_id', v_redemption_id)
  );

  return v_redemption_id;
end;
$$;

-- 2) Vista para descubrir clubes elegibles por cupones activos (mapa)
create or replace view public.v_user_eligible_club_offers as
select
  c.user_id,
  cb.id as club_branch_id,
  cb.club_id,
  c.sport_id,
  count(*) filter (where c.status = 'available') as available_coupons
from public.coupons c
join public.club_sport_offerings cso on cso.sport_id = c.sport_id and cso.is_active = true
join public.club_branches cb on cb.id = cso.club_branch_id and cb.is_active = true
where c.status = 'available'
group by c.user_id, cb.id, cb.club_id, c.sport_id;

-- ---------------------------------------------------------
-- RLS base
-- ---------------------------------------------------------
alter table public.users_profile enable row level security;
alter table public.user_roles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_periods enable row level security;
alter table public.coupons enable row level security;
alter table public.qr_tokens enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.club_staff_assignments enable row level security;

-- users_profile: cada usuario ve y edita su perfil
create policy users_profile_select_own on public.users_profile
for select using (auth.uid() = id);

create policy users_profile_update_own on public.users_profile
for update using (auth.uid() = id)
with check (auth.uid() = id);

-- user_roles: un usuario puede ver sus roles
create policy user_roles_select_own on public.user_roles
for select using (auth.uid() = user_id);

-- subscriptions/periods/coupons/qr/redemptions: dueño de datos
create policy subscriptions_select_own on public.subscriptions
for select using (auth.uid() = user_id);

create policy subscription_periods_select_own on public.subscription_periods
for select using (
  exists (
    select 1
    from public.subscriptions s
    where s.id = subscription_id
      and s.user_id = auth.uid()
  )
);

create policy coupons_select_own on public.coupons
for select using (auth.uid() = user_id);

create policy qr_tokens_select_own on public.qr_tokens
for select using (auth.uid() = user_id);

create policy redemptions_select_own on public.coupon_redemptions
for select using (
  exists (
    select 1
    from public.coupons c
    where c.id = coupon_id
      and c.user_id = auth.uid()
  )
);

-- staff puede leer canjes de sus sedes asignadas
create policy redemptions_select_staff_branch on public.coupon_redemptions
for select using (
  exists (
    select 1
    from public.club_staff_assignments csa
    where csa.user_id = auth.uid()
      and csa.club_branch_id = coupon_redemptions.club_branch_id
      and csa.is_active = true
  )
);
```

---

## 2) Notas de implementación de autenticación

1. **Auth principal**: Supabase Auth (email/password, magic link, Apple, Google, etc.).
2. **Post-registro automático**:
   - `trigger on auth.users` crea `users_profile`.
   - asigna rol `customer` en `user_roles`.
3. **Autorización**:
   - App de usuario usa JWT estándar y RLS para “mis datos”.
   - Panel admin/staff puede usar JWT normal con roles + políticas específicas.
   - Operaciones críticas (canje, reversos, webhooks de pago) en Edge Functions con Service Role.
4. **Flujo QR recomendado**:
   - la app pide QR efímero (nonce + TTL corto),
   - staff escanea,
   - backend llama a `redeem_coupon(...)`.

---

## 3) Próximos scripts recomendados

- Script de **seed** (deportes, planes, beneficios de ejemplo).
- Script de **políticas admin/ops** adicionales (gestión de catálogo, soporte).
- Script de **pagos** (tablas de transacciones/webhooks/idempotencia).
- Función SQL o RPC para `map/discover` con filtro por distancia (`ST_DWithin`).

