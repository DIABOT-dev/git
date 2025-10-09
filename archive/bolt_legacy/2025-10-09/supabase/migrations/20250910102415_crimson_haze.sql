-- ========== Helpers ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ========== Enums (idempotent) ==========
do $$ begin
  if not exists (select 1 from pg_type where typname = 'sex') then
    create type sex as enum ('male','female','other'); end if;
  if not exists (select 1 from pg_type where typname = 'goal') then
    create type goal as enum ('lose_weight','build_muscle','stabilize_glucose'); end if;
  if not exists (select 1 from pg_type where typname = 'glucose_tag') then
    create type glucose_tag as enum ('fasting','before_meal','after_meal','bedtime','random'); end if;
  if not exists (select 1 from pg_type where typname = 'insulin_type') then
    create type insulin_type as enum ('bolus','basal','mixed','correction'); end if;
  if not exists (select 1 from pg_type where typname = 'drink_kind') then
    create type drink_kind as enum ('water','tea','coffee','milk','other'); end if;
end $$;

-- ========== Tables ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text unique,
  dob date,
  sex sex,
  height_cm int2,
  weight_kg numeric(5,2),
  waist_cm int2,
  goal goal,
  conditions jsonb not null default '{}'::jsonb,
  prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.glucose_logs (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value_mgdl int2 not null,
  tag glucose_tag,
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_glucose_user_taken on public.glucose_logs(user_id, taken_at desc);

create table if not exists public.meal_logs (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  carbs_g numeric(6,2),
  calories_kcal numeric(7,2),
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_meal_user_taken on public.meal_logs(user_id, taken_at desc);

create table if not exists public.water_logs (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_ml int2 not null check (amount_ml > 0),
  kind drink_kind,
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_water_user_taken on public.water_logs(user_id, taken_at desc);

create table if not exists public.insulin_logs (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  dose_units numeric(6,2) not null check (dose_units >= 0),
  type insulin_type,
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_insulin_user_taken on public.insulin_logs(user_id, taken_at desc);

create table if not exists public.weight_logs (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_weight_user_taken on public.weight_logs(user_id, taken_at desc);

create table if not exists public.bp_logs (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  systolic int2 not null check (systolic between 60 and 300),
  diastolic int2 not null check (diastolic between 30 and 200),
  pulse int2,
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_bp_user_taken on public.bp_logs(user_id, taken_at desc);

create table if not exists public.metrics_day (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  metric text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day, metric)
);

create table if not exists public.metrics_week (
  user_id uuid not null references public.profiles(id) on delete cascade,
  week int4 not null, -- e.g. 202537
  metric text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, week, metric)
);

-- ========== Triggers ==========
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_metrics_day_updated_at on public.metrics_day;
create trigger trg_metrics_day_updated_at before update on public.metrics_day
for each row execute function public.set_updated_at();

drop trigger if exists trg_metrics_week_updated_at on public.metrics_week;
create trigger trg_metrics_week_updated_at before update on public.metrics_week
for each row execute function public.set_updated_at();

-- ========== RLS ==========
alter table public.profiles enable row level security;
alter table public.glucose_logs enable row level security;
alter table public.meal_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.insulin_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.bp_logs enable row level security;
alter table public.metrics_day enable row level security;
alter table public.metrics_week enable row level security;

-- profiles: chỉ chính chủ
drop policy if exists p_profiles_select on public.profiles;
drop policy if exists p_profiles_upsert on public.profiles;
create policy p_profiles_select on public.profiles
for select using (id = auth.uid());
create policy p_profiles_upsert on public.profiles
for insert with check (id = auth.uid());
create policy p_profiles_update on public.profiles
for update using (id = auth.uid());

-- logs & metrics: chỉ chính chủ
create policy if not exists p_glucose_rw on public.glucose_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_meal_rw on public.meal_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_water_rw on public.water_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_insulin_rw on public.insulin_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_weight_rw on public.weight_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_bp_rw on public.bp_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_metrics_day_rw on public.metrics_day
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists p_metrics_week_rw on public.metrics_week
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ========== Seed user profile for DEV ==========
insert into public.profiles (id, email)
values ('a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2', 'Tungchevyman@gmail.com')
on conflict (id) do update set email = excluded.email;