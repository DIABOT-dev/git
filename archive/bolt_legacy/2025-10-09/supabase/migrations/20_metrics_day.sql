-- [Q22] table.metrics_day
create table if not exists public.metrics_day(
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  metric text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key(user_id, day, metric)
);

-- [Q23] trigger.metrics_day.updated_at
drop trigger if exists trg_metrics_day_updated on public.metrics_day;
create trigger trg_metrics_day_updated
before update on public.metrics_day
for each row execute procedure set_updated_at();
