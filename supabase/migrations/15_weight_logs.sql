-- [Q18] table.weight_logs
create table if not exists public.weight_logs(
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric not null,
  taken_at timestamptz not null,
  created_at timestamptz default now()
);

-- [Q19] index.weight_logs.user_taken
create index if not exists idx_weight_user_taken
  on public.weight_logs(user_id, taken_at desc);
