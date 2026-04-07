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
            <p className="max-w-2xl text-sm leading-6 text-zinc-600">
              Учебная информационная система для планирования и ручного контроля
              контрольных точек релиза.
            </p>
          </div>
          <Link
            href="/releases"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Перейти к релизам
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-zinc-900">
                Что уже сделано (Этап 0)
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                <li>CRUD релизов</li>
                <li>Справочник контрольных точек</li>
                <li>Связка релиз ↔ КТ (инициализация и ручное редактирование)</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-900">
                Следующий этап
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                <li>Расчет дат КТ от даты релиза по рабочим дням</li>
                <li>Учет задач (в часах) и стеков для растяжения интервалов</li>
                <li>Отчеты/аналитика</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
