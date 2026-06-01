# Архитектура (текущая)

## Выбранный стек

- **Next.js (App Router)**: React UI + API в одном проекте (один Vercel-проект)
- **Neon Postgres**: постоянная managed БД
- **Vercel**: деплой (stateless). Данные не теряются, потому что источник правды — Neon.

## Поток данных

UI (React) → HTTP → Next API (`src/app/api/**`) → сервисы (`src/services/**`) → слой БД (`src/db/*`) → Neon Postgres

## Структура репозитория

- `src/app/` — страницы и API routes (App Router)
- `src/services/` — бизнес-логика (релизы, этапы, расчёт дат, отчёты)
- `src/config/` — конфигурация цепочки этапов и отчётов
- `src/db/` — подключение и запросы к Postgres
- `migrations/` — SQL-миграции (применяются вручную в Neon SQL Editor)
- `docs/` — ТЗ, модель данных, доменные правила, roadmap

Основные страницы: `/releases`, `/releases/:id`, `/reports`. Проверка БД: `/api/health`.

Расчёт дат этапов: `src/services/scheduling/`, конфиг `src/config/scheduling.ts`.  
Статус-сообщение для чата: `src/services/reports/`, `GET /api/reports/status-message`.

## Почему данные не теряются при деплое

Vercel пересобирает только код (stateless). База Neon живёт отдельно, подключение через `DATABASE_URL`.

## Осознанные ограничения

- Нет ORM, auth и микросервисов — простой стек по [roadmap](04_ROADMAP.md)
- Правила сдвигов и техокон задаются в коде; менять их нужно согласованно с [логикой расчёта](07_SCHEDULING_LOGIC.md)
- Часы задач и стеки пока не влияют на формулы сдвигов (см. ТЗ и roadmap)
