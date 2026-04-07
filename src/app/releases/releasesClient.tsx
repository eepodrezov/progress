"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReleaseRow } from "./releaseTypes";

type ApiError = { error: string };

function asErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as any).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

export function ReleasesClient() {
  const [items, setItems] = useState<ReleaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const canSubmit = useMemo(() => {
    return key.trim() && title.trim() && /^\d{4}-\d{2}-\d{2}$/.test(releaseDate);
  }, [key, title, releaseDate]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/releases", { cache: "no-store" });
      const json = (await res.json()) as { items?: ReleaseRow[] } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setItems(json.items ?? []);
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, title, releaseDate }),
      });
      const json = (await res.json()) as { item?: ReleaseRow } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setKey("");
      setTitle("");
      await load();
    } catch (e2) {
      setError(asErrorMessage(e2));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={onCreate} className="space-y-3">
        <label className="block">
          <div className="text-xs font-medium text-zinc-700">key</div>
          <input
            className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="R-2026-04"
          />
        </label>

        <label className="block">
          <div className="text-xs font-medium text-zinc-700">title</div>
          <input
            className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="April release"
          />
        </label>

        <label className="block">
          <div className="text-xs font-medium text-zinc-700">release date</div>
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Создаю..." : "Создать релиз"}
        </button>
      </form>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="border-t border-zinc-100 pt-4">
        <div className="mb-2 text-xs font-medium text-zinc-700">
          Релизы ({loading ? "..." : items.length})
        </div>

        {loading ? (
          <div className="text-sm text-zinc-600">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-600">Пока нет релизов.</div>
        ) : (
          <div className="space-y-2">
            {items.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-900">
                    {r.key} — {r.title}
                  </div>
                  <div className="text-xs text-zinc-600">
                    Release date: {r.release_date}
                  </div>
                </div>
                <Link
                  href={`/releases/${r.id}`}
                  className="shrink-0 text-sm font-medium text-zinc-900 underline"
                >
                  Открыть
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

