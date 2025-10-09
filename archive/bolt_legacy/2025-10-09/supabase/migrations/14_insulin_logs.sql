-- Create/Upgrade public.insulin_logs

-- 1) Tạo mới nếu chưa có
create table if not exists public.insulin_logs (
  id         bigint primary key generated always as identity,
  user_id    uuid not null references auth.users(id) on delete cascade,
  dose_units numeric not null,
  type       insulin_type,
  taken_at   timestamptz not null,
  created_at timestamptz default now()
);

-- 2) Bổ sung cột còn thiếu (nếu bảng cũ tồn tại)
alter table public.insulin_logs
  add column if not exists user_id    uuid,
  add column if not exists dose_units numeric,
  add column if not exists type       insulin_type,
  add column if not exists taken_at   timestamptz,
  add column if not exists created_at timestamptz;

-- 3) Backfill trước khi đặt NOT NULL
alter table public.insulin_logs alter column created_at set default now();

update public.insulin_logs
set created_at = coalesce(created_at, now())
where created_at is null;

update public.insulin_logs
set taken_at = coalesce(taken_at, created_at, now())
where taken_at is null;

update public.insulin_logs
set dose_units = coalesce(dose_units, 0)
where dose_units is null;

-- 4) Thêm FK nếu thiếu
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.insulin_logs'::regclass
      and contype = 'f' and conname = 'insulin_logs_user_fk'
  ) then
    alter table public.insulin_logs
      add constraint insulin_logs_user_fk
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- 5) Đặt NOT NULL
alter table public.insulin_logs
  alter column user_id    set not null,
  alter column dose_units set not null,
  alter column taken_at   set not null,
  alter column created_at set not null;

-- 6) RLS + Indexes
alter table public.insulin_logs enable row level security;

create index if not exists idx_insulin_user_id
  on public.insulin_logs(user_id);

create index if not exists idx_insulin_user_taken
  on public.insulin_logs(user_id, taken_at desc);
