-- Флаги релиза для расчёта сдвигов между этапами

alter table releases
  add column if not exists flag_int boolean not null default false,
  add column if not exists flag_psy boolean not null default false,
  add column if not exists flag_nt boolean not null default false;
