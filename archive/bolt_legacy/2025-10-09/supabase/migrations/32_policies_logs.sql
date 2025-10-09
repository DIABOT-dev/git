-- [Q30] policy.glucose_logs.own
do $$ begin
  create policy "glucose_own" on public.glucose_logs
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;

-- [Q31] policy.meal_logs.own
do $$ begin
  create policy "meal_own" on public.meal_logs
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;

-- [Q32] policy.water_logs.own
do $$ begin
  create policy "water_own" on public.water_logs
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;

-- [Q33] policy.insulin_logs.own
do $$ begin
  create policy "insulin_own" on public.insulin_logs
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;

-- [Q34] policy.weight_logs.own
do $$ begin
  create policy "weight_own" on public.weight_logs
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;

-- [Q35] policy.bp_logs.own
do $$ begin
  create policy "bp_own" on public.bp_logs
  for all using (is_self(user_id)) with check (is_self(user_id));
exception when duplicate_object then null; end $$;
