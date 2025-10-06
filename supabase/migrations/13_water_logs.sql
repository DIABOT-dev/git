-- [Q14] table.water_logs
create table if not exists public.water_logs(
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml int2 not null,
  kind drink_kind default 'water',
  taken_at timestamptz not null,
  created_at timestamptz default now()
);

-- [Q15] index.water_logs.user_taken
create index if not exists idx_water_user_taken
  on public.water_logs(user_id, taken_at desc);
