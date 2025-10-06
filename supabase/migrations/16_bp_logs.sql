-- [Q20] table.bp_logs
create table if not exists public.bp_logs(
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  systolic int2 not null,
  diastolic int2 not null,
  pulse int2,
  taken_at timestamptz not null,
  created_at timestamptz default now()
);

-- [Q21] index.bp_logs.user_taken
create index if not exists idx_bp_user_taken
  on public.bp_logs(user_id, taken_at desc);
