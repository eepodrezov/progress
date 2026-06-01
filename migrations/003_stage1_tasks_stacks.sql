-- Этап 1: доменная модель (tasks/stacks), статусы релиза, suggested_at для КТ
-- Применять вручную в Neon SQL editor ПОСЛЕ 001/002.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'release_status') then
    create type release_status as enum ('draft', 'active', 'done', 'cancelled');
  end if;
end $$;

alter table releases
  add column if not exists status release_status not null default 'draft';

alter table release_milestones
  add column if not exists suggested_at timestamptz null;

create table if not exists release_tasks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references releases(id) on delete cascade,
  title text not null,
  hours numeric(10,2) not null check (hours >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_release_tasks_release_id on release_tasks(release_id);

create table if not exists stacks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  is_active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists release_stacks (
  release_id uuid not null references releases(id) on delete cascade,
  stack_id uuid not null references stacks(id),
  created_at timestamptz not null default now(),
  primary key (release_id, stack_id)
);

create index if not exists idx_release_stacks_release_id on release_stacks(release_id);

