"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ApiError = { error: string };

const LEGEND = [
  ["🟩", "по плану"],
  ["🟧", "можем опоздать (≤ 1 день до дедлайна)"],
  ["🟥", "опоздали"],
  ["✅", "выполнен"],
  ["☑️", "выполнен с опозданием"],
  ["🛑", "blocked"],
  ["⬇", "skipped"],
] as const;

function asErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

export function StatusReportClient() {
  const [text, setText] = useState("");
  const [telegramText, setTelegramText] = useState("");
  const [releaseCount, setReleaseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/status-message", {
        cache: "no-store",
      });
      const json = (await res.json()) as {
        text?: string;
        telegramText?: string;
        releaseCount?: number;
      } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setText(json.text ?? "");
      setTelegramText(json.telegramText ?? json.text ?? "");
      setReleaseCount(json.releaseCount ?? 0);
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(telegramText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не удалось скопировать в буфер");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
        >
          {loading ? "…" : "Обновить"}
        </button>
        <button
          type="button"
          onClick={() => void onCopy()}
          disabled={loading || !text}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {copied ? "Скопировано" : "Копировать в Telegram"}
        </button>
        <span className="text-xs text-zinc-600">
          Релизов в отчёте: {releaseCount}
        </span>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-3 text-xs font-medium text-zinc-950">Легенда</div>
        <ul className="grid gap-1 text-xs text-zinc-700 sm:grid-cols-2">
          {LEGEND.map(([emoji, label]) => (
            <li key={emoji}>
              {emoji} — {label}
            </li>
          ))}
        </ul>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-950">Загрузка…</div>
      ) : (
        <pre
          className="overflow-x-auto whitespace-pre rounded-md border border-zinc-200 bg-white p-4 font-mono text-sm leading-relaxed text-zinc-950"
          style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        >
          {text}
        </pre>
      )}

      <p className="text-xs text-zinc-600">
        В отчёт попадают релизы со статусом не done/cancelled и с сохранённым
        планом этапов. При копировании таблица этапов оборачивается в блок{" "}
        <code className="text-zinc-800">```</code> — в Telegram колонки
        выравниваются моноширинным шрифтом. Ссылка «СОСТАВ РЕЛИЗОВ» — из{" "}
        <code className="text-zinc-800">RELEASE_COMPOSITION_URL</code>.
      </p>

      <Link
        href="/releases"
        className="inline-block text-sm font-medium text-zinc-950 underline"
      >
        ← К релизам
      </Link>
    </div>
  );
}
