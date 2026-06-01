# Шаблоны отчетов

## 1) Статус по релизам (сообщение в чат) — **выполнено** (май 2026)

Страница: `/reports`  
API: `GET /api/reports/status-message`

**Фильтр:** релизы с `status` не `done` / `cancelled`, только с сохранённым планом (`release_stages`).

### Шаблон

```
📈☑️    Статус релизов    ✅🚀
                      🟩🟧🟥

{releases.title}
Дата релиза: {DD-DD.MM}
Текущий статус: {title_ru текущего этапа}

{stage_code}  {DD.MM}{s|e}  {emoji}
...
```

Для Telegram при копировании (`telegramText`) таблица этапов обёрнута в markdown-блок кода (тройные обратные кавычки) — моноширинный шрифт в чате. Заголовок релиза и ссылка «СОСТАВ РЕЛИЗОВ» остаются снаружи блока (ссылка кликабельна).

=> [СОСТАВ РЕЛИЗОВ]({RELEASE_COMPOSITION_URL}) <=

### Легенда эмодзи

| Эмодзи | Значение | Условие |
|--------|----------|---------|
| 🟩 | по плану | `planned`, дедлайн в будущем, > 1 кален. дня |
| 🟧 | можем опоздать | `planned`, осталось ≤ 1 кален. день |
| 🟥 | опоздали | `planned`, `now > planned_at` |
| ✅ | выполнен | `done` в срок |
| ☑️ | выполнен с опозданием | `done`, `actual_at > planned_at` |
| 🛑 | blocked | `status = blocked` |
| ⬇ | skipped | `status = skipped` |

### Форматы дат

- **Дата релиза:** `DD-DD.MM` — из `ZNI_DONE.planned_at` (ночь → два дня) или `releases.release_date`
- **Этап:** `planned_at` → `DD.MM` + `s` (до 18:00) / `e` (с 18:00)

### Конфиг

- `RELEASE_COMPOSITION_URL` в `.env` / `.env.local` — ссылка в футере (Telegram Markdown)
- `src/config/reports.ts` — `AT_RISK_WITHIN_CALENDAR_DAYS = 1`

---

## 2) Подробный лог релиза (для разбора) — в планах

```
Release: {title}
Release date: {release_date}

Stages:
- {stage_code} — {title_ru}
  planned: ...
  actual:  ...
  status:  ...
  delay:   ...
  reason:  ...
```

---

## 3) Аналитика (идея форматов) — в планах

- «% просроченных КТ по типам»
- «средняя/медианная задержка по типам»
- «топ причин задержек»

Экспорт CSV: `release_key, stage_code, planned_at, actual_at, delay_hours, reason, stacks, task_hours`
