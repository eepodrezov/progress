-- Этапы релиза по stage_code (без справочника milestone_templates)

create table if not exists release_stages (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references releases(id) on delete cascade,
  stage_code text not null,
  title_ru text not null,
  suggested_at timestamptz null,
  planned_at timestamptz null,
  status release_milestone_status not null default 'planned',
  actual_at timestamptz null,
  delay_reason text null,
  created_at timestamptz not null default now(),
  unique (release_id, stage_code)
);

create index if not exists idx_release_stages_release_id on release_stages(release_id);
