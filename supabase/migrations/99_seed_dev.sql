-- [Q38] seed.dev.profile
insert into public.profiles (id, email, created_at, updated_at)
values ('a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2','Tungchevyman@gmail.com', now(), now())
on conflict (id) do update set email = excluded.email, updated_at = now();
