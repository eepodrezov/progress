-- Release Milestone Tracker: базовая схема (Этап 0)
-- Применять вручную в Neon SQL editor.

create extension if not exists pgcrypto;

create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  release_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists milestone_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  default_offset_workdays int not null,
  is_default_selected boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'release_milestone_status') then
    create type release_milestone_status as enum ('planned', 'done', 'blocked', 'skipped');
  end if;
end $$;

create table if not exists release_milestones (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references releases(id) on delete cascade,
  template_id uuid not null references milestone_templates(id),
  planned_at timestamptz null,
  status release_milestone_status not null default 'planned',
  actual_at timestamptz null,
  delay_reason text null,
  created_at timestamptz not null default now(),
  unique (release_id, template_id)
);

create index if not exists idx_release_milestones_release_id on release_milestones(release_id);
