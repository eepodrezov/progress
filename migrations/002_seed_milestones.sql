-- Release Milestone Tracker: сиды справочника контрольных точек (Этап 0)
-- Можно править под свою команду (offset — рабочих дней ДО даты релиза; на Этапе 0 это просто справочник).

insert into milestone_templates (code, title, default_offset_workdays, is_default_selected, sort_order)
values
  ('SCOPE_LOCK',       'Scope lock / согласование состава релиза', 15, true, 10),
  ('DEV_COMPLETE',     'Dev complete (все задачи в Done)',         10, true, 20),
  ('CODE_FREEZE',      'Code freeze',                               7, true, 30),
  ('QA_START',         'QA start',                                  6, true, 40),
  ('QA_COMPLETE',      'QA complete',                               2, true, 50),
  ('RELEASE_GO_NO_GO', 'Go/No-Go',                                  1, true, 60),
  ('RELEASE',          'Release',                                   0, true, 70)
on conflict (code) do update set
  title = excluded.title,
  default_offset_workdays = excluded.default_offset_workdays,
  is_default_selected = excluded.is_default_selected,
  sort_order = excluded.sort_order;
