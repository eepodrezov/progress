import Link from "next/link";
import { ReleasesClient } from "./releasesClient";

export default function ReleasesPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Releases
            </h1>
            <p className="mt-1 text-sm text-zinc-950">
              Создай релиз (key и название), даты этапов — в планировании.
            </p>
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <Link href="/reports" className="text-zinc-950 underline">
              Статус для чата
            </Link>
            <Link href="/" className="text-zinc-950 underline">
              На главную
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium text-zinc-950">
              Новый релиз
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-950">
              `key` — краткий ID (например, `R-2026-04`).
            </p>
            <ReleasesClient />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium text-zinc-950">Подсказка</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-950">
              <div>
                1) Создай релиз слева.
              </div>
              <div>2) Открой релиз → блок «Планирование этапов» → Рассчитать.</div>
              <div>3) Сохранить план и при необходимости править даты.</div>
              <div>4) Вести факт прохождения этапов в таблице ниже.</div>
            </div>
            <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-950">
              API health: <a className="underline" href="/api/health">/api/health</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

