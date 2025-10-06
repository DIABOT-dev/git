-- [Q8] table.profiles
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  dob date,
  sex sex,
  height_cm int2,
  weight_kg numeric(5,2),
  waist_cm int2,
  goal goal,
  conditions jsonb default '[]'::jsonb,
  prefs jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- [Q9] trigger.profiles.updated_at
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
before update on public.profiles
for each row execute procedure set_updated_at();
