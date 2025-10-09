-- [Q6] fn.set_updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- [Q7] fn.is_self
create or replace function is_self(uid uuid)
returns boolean language sql immutable as
$$ select uid = auth.uid() $$;
