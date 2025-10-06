-- [Q36] policy.metrics_day.own
do $$ begin
  create policy "metrics_day_own" on public.metrics_day
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;

-- [Q37] policy.metrics_week.own
do $$ begin
  create policy "metrics_week_own" on public.metrics_week
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;
