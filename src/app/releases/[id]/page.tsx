import Link from "next/link";
import { ReleaseMilestonesClient } from "./releaseMilestonesClient";

export default async function ReleasePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Release
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Ручной учет контрольных точек (Этап 0).
            </p>
          </div>
          <Link
            href="/releases"
            className="text-sm font-medium text-zinc-700 underline"
          >
            ← К релизам
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
          <ReleaseMilestonesClient releaseId={id} />
        </div>
      </main>
    </div>
  );
}

