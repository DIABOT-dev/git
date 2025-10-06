-- [Q27] policy.profiles.select_self
do $$ begin
  create policy "profiles_select_self"
    on public.profiles for select using (id = auth.uid());
exception when duplicate_object then null; end $$;

-- [Q28] policy.profiles.insert_self
do $$ begin
  create policy "profiles_insert_self"
    on public.profiles for insert with check (id = auth.uid());
exception when duplicate_object then null; end $$;

-- [Q29] policy.profiles.update_self
do $$ begin
  create policy "profiles_update_self"
    on public.profiles for update using (id = auth.uid());
exception when duplicate_object then null; end $$;
