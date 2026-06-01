import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Release Milestone Tracker
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-950">
              Учебная информационная система для планирования и ручного контроля
              контрольных точек релиза.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/releases"
              className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Перейти к релизам
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
            >
              Статус для чата
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-zinc-950">
                Реализовано
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-950">
                <li>Релизы: создание, список, карточка</li>
                <li>
                  Планирование этапов: расчёт suggested (от FF или от релиза),
                  флаги INT / PSY / NT, техокна, сохранение плана
                </li>
                <li>
                  Учёт этапов: planned, suggested, status, actual, причина
                  задержки
                </li>
                <li>Задачи релиза (часы) и выбор стеков</li>
                <li>
                  Статус для чата (/reports): отчёт по этапам, эмодзи статусов,
                  копирование в Telegram (блок кода), ссылка на состав релизов
                </li>
                <li>Next.js API + Postgres (Neon), документация в docs/</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-950">В планах</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-950">
                <li>Подробный лог релиза (ТЗ §5.2)</li>
                <li>Аналитика ретро и экспорт CSV (ТЗ §5.3)</li>
                <li>Аудит изменений, админка справочников в UI</li>
                <li>
                  Уточнение формул: календарь исключений, влияние часов/стеков
                  на сдвиги (сейчас сдвиги в конфиге)
                </li>
                <li>Auth и роли (опционально)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
