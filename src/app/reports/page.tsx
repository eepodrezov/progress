import Link from "next/link";
import { StatusReportClient } from "./statusReportClient";

export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Статус для чата
            </h1>
            <p className="mt-1 text-sm text-zinc-950">
              Короткий отчёт по активным релизам — скопируйте в Telegram.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-950 underline"
          >
            ← На главную
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
          <StatusReportClient />
        </div>
      </main>
    </div>
  );
}
