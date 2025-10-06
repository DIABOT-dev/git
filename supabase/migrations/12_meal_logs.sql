-- [Q12] table.meal_logs
create table if not exists public.meal_logs(
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb default '[]'::jsonb,
  carbs_g numeric,
  calories_kcal numeric,
  taken_at timestamptz not null,
  created_at timestamptz default now()
);

-- [Q13] index.meal_logs.user_taken
create index if not exists idx_meal_user_taken
  on public.meal_logs(user_id, taken_at desc);
