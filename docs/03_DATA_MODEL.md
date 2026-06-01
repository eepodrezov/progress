# Модель данных

## Текущая схема (Этап 1)

### `releases`
- `id` (uuid)
- `key` (text, unique) — человекочитаемый ID релиза
- `title` (text)
- `release_date` (date)
- `status` (enum: draft|active|done|cancelled)
- `flag_int`, `flag_psy`, `flag_nt` (boolean) — влияют на сдвиги при расчёте
- `created_at` (timestamptz)

### `milestone_templates`
Справочник контрольных точек.

- `id` (uuid)
- `code` (text, unique)
- `title` (text)
- `default_offset_workdays` (int) — **сколько рабочих дней до релиза** (для будущего расчета)
- `is_default_selected` (bool) — “базово выбран”
- `sort_order` (int)
- `created_at` (timestamptz)

### `release_stages` (основное хранение этапов релиза)

Этапы задаются в коде (`src/config/scheduling.ts`), в БД — только инстансы по релизу.

- `id` (uuid)
- `release_id` → `releases.id`
- `stage_code` (text) — FF, ZNO_DOCS, …
- `title_ru` (text)
- `suggested_at` (timestamptz, nullable) — результат расчёта
- `planned_at` (timestamptz, nullable) — подтверждённый план
- `status` (enum: planned|done|blocked|skipped)
- `actual_at`, `delay_reason`, `created_at`

### `release_milestones` (legacy, Этап 0)

Старая модель через `milestone_templates`. Новый UI использует `release_stages`.

### `release_tasks`
Задачи релиза (оценки в часах).

- `id` (uuid)
- `release_id` → `releases.id`
- `title` (text)
- `hours` (numeric)
- `created_at` (timestamptz)

### `stacks` и `release_stacks`
Справочник стеков и участие стеков в релизе.

`stacks`:
- `id` (uuid)
- `code` (text, unique)
- `title` (text)
- `is_active` (bool)
- `sort_order` (int)
- `created_at` (timestamptz)

`release_stacks`:
- `release_id` → `releases.id`
- `stack_id` → `stacks.id`
- `created_at` (timestamptz)

## План расширения схемы

### Данные для расчета
- `team_calendar`:
  - рабочая неделя + исключения (праздники/переносы)
- `estimation_rules`:
  - коэффициенты/версии правил расчета (для воспроизводимости)

### Аудит/история изменений (для ретро)
- `audit_events`:
  - тип события (изменили planned/status, отметили done, добавили reason)
  - кто/когда (если появится auth)
  - значения before/after

## Бизнес-правило (минимум)
- если `status = blocked`, нужен `delay_reason`
- при аналитике задержек сравниваем \(actual\_at\) vs \(planned\_at\) (или \(suggested\_at\) — зависит от сценария)
