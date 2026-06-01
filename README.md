## Release Milestone Tracker

Учебный проект: **информационная система контроля релизного цикла команды**.

### Что умеет сейчас
- **Релизы**: создание, список, карточка
- **Планирование этапов**: расчёт suggested (от FF или от релиза), флаги INT/PSY/NT, сохранение плана
- **Учёт этапов**: planned, suggested, status, actual, причина задержки
- **Статус для чата**: `/reports` — текст по шаблону, копирование в Telegram
- **Задачи и стеки** на релизе (часы, выбор стеков)
- **Хранение**: Postgres (Neon) — данные не теряются при деплое на Vercel

---

## Локальный запуск

### 1) Установить зависимости

```bash
npm install
```

### 2) Подготовить Neon Postgres и применить миграции

1. Создай проект в Neon и открой **SQL Editor**
2. Выполни по очереди:
   - `migrations/001_init.sql`
   - `migrations/002_seed_milestones.sql`
   - `migrations/003_stage1_tasks_stacks.sql`
   - `migrations/004_release_flags.sql`
   - `migrations/005_release_stages.sql`
   - `migrations/006_release_date_nullable.sql`

### 3) Настроить переменные окружения

Создай `.env.local`:

```bash
DATABASE_URL=postgres://...
```

### 4) Запустить dev-сервер

```bash
npm run dev
```

Открой `http://localhost:3000`

Полезные страницы:
- `/releases` — список/создание релизов
- `/releases/:id` — КТ релиза (ручной учет)
- `/reports` — статусное сообщение для чата
- `/api/health` — проверка подключения к БД

Опционально в `.env.local`:

```bash
RELEASE_COMPOSITION_URL=https://sfera.inno.local/knowledge/show/1443664/relizy
```

---

## Деплой (Vercel)

1. Подключи репозиторий в Vercel
2. Добавь env var `DATABASE_URL` (строка подключения Neon)
3. Деплой и smoke-test: `/api/health`

---

## Документация проекта

Смотри `docs/`:
- `docs/01_TZ.md` — ТЗ (единый источник требований)
- `docs/02_ARCHITECTURE.md` — архитектура (Next.js + Neon + Vercel)
- `docs/03_DATA_MODEL.md` — модель данных (как есть + план расширения)
- `docs/04_ROADMAP.md` — этапы реализации
- `docs/05_REPORT_TEMPLATES.md` — шаблоны отчётов (статус в чате — готов)
- `docs/06_DOMAIN_RULES.md` — доменные правила и статусы
- `docs/07_SCHEDULING_LOGIC.md` — логика расчёта дат этапов

