-- [Q10] table.glucose_logs
create table if not exists public.glucose_logs(
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  value_mgdl int2 not null,
  tag glucose_tag,
  taken_at timestamptz not null,
  created_at timestamptz default now()
);

-- [Q11] index.glucose_logs.user_taken
create index if not exists idx_glucose_user_taken
  on public.glucose_logs(user_id, taken_at desc);
