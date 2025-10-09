-- [Q24] table.metrics_week
create table if not exists public.metrics_week(
  user_id uuid not null references auth.users(id) on delete cascade,
  week int4 not null,
  metric text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key(user_id, week, metric)
);

-- [Q25] trigger.metrics_week.updated_at
drop trigger if exists trg_metrics_week_updated on public.metrics_week;
create trigger trg_metrics_week_updated
before update on public.metrics_week
for each row execute procedure set_updated_at();
