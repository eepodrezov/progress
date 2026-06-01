"use client";

import { useEffect, useState } from "react";

type ApiError = { error: string };

type PreviewStage = {
  stageCode: string;
  titleRu: string;
  suggestedAt: string;
  plannedAt: string;
};

function asErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromLocalInputValue(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function ReleasePlanningClient(props: { releaseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"fromFF" | "fromREL">("fromFF");
  const [intFlag, setIntFlag] = useState(false);
  const [psyFlag, setPsyFlag] = useState(false);
  const [ntFlag, setNtFlag] = useState(false);
  const [ffStart, setFfStart] = useState("");
  const [relStart, setRelStart] = useState("");
  const [relEnd, setRelEnd] = useState("");
  const [stages, setStages] = useState<PreviewStage[]>([]);
  const [anchors, setAnchors] = useState<{
    FF?: string;
    CF?: string;
    REL?: string;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/releases/${props.releaseId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as {
          item?: {
            release_date: string;
            flag_int?: boolean;
            flag_psy?: boolean;
            flag_nt?: boolean;
          };
        } & ApiError;
        if (!res.ok || !json.item) return;
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const rd = json.item.release_date ?? today;
        setFfStart(`${rd}T09:00`);
        setRelStart(`${rd}T21:00`);
        setRelEnd(`${rd}T23:00`);
        setIntFlag(Boolean(json.item.flag_int));
        setPsyFlag(Boolean(json.item.flag_psy));
        setNtFlag(Boolean(json.item.flag_nt));
      } catch {
        /* ignore */
      }
    })();
  }, [props.releaseId]);

  async function preview() {
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        mode,
        flags: { INT: intFlag, PSY: psyFlag, NT: ntFlag },
      };
      if (mode === "fromFF") {
        const iso = fromLocalInputValue(ffStart);
        if (!iso) throw new Error("Укажите дату FF");
        body.ffStartAt = iso;
      } else {
        const startIso = fromLocalInputValue(relStart);
        const endIso = fromLocalInputValue(relEnd);
        if (!startIso && !endIso) throw new Error("Укажите окно релиза");
        if (startIso) body.releaseWindowStartAt = startIso;
        if (endIso) body.releaseWindowEndAt = endIso;
      }

      const res = await fetch(
        `/api/releases/${props.releaseId}/schedule/preview`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = (await res.json()) as {
        stages?: { stageCode: string; titleRu: string; suggestedAt: string }[];
        anchors?: { FF: string; CF: string; REL: string };
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

      setAnchors(json.anchors ?? null);
      setStages(
        (json.stages ?? []).map((s) => ({
          stageCode: s.stageCode,
          titleRu: s.titleRu,
          suggestedAt: s.suggestedAt,
          plannedAt: s.suggestedAt,
        })),
      );
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (stages.length === 0) {
      setError("Сначала выполните расчёт (Preview)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/releases/${props.releaseId}/schedule/apply`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            flags: { INT: intFlag, PSY: psyFlag, NT: ntFlag },
            stages: stages.map((s) => ({
              stageCode: s.stageCode,
              titleRu: s.titleRu,
              suggestedAt: s.suggestedAt,
              plannedAt: fromLocalInputValue(s.plannedAt),
            })),
          }),
        },
      );
      const json = (await res.json()) as { ok?: boolean } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      window.location.reload();
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-zinc-950">Планирование этапов</div>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-950">
        <label className="flex items-center gap-2 text-zinc-950">
          <input
            type="radio"
            checked={mode === "fromFF"}
            onChange={() => setMode("fromFF")}
          />
          От FF вперёд
        </label>
        <label className="flex items-center gap-2 text-zinc-950">
          <input
            type="radio"
            checked={mode === "fromREL"}
            onChange={() => setMode("fromREL")}
          />
          От релиза назад
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 text-zinc-950">
          <input
            type="checkbox"
            checked={intFlag}
            onChange={(e) => setIntFlag(e.target.checked)}
          />
          INT (интеграция front/back)
        </label>
        <label className="flex items-center gap-2 text-zinc-950">
          <input
            type="checkbox"
            checked={psyFlag}
            onChange={(e) => setPsyFlag(e.target.checked)}
          />
          PSY (ПСИ)
        </label>
        <label className="flex items-center gap-2 text-zinc-950">
          <input
            type="checkbox"
            checked={ntFlag}
            onChange={(e) => setNtFlag(e.target.checked)}
          />
          NT (НТ)
        </label>
      </div>

      {mode === "fromFF" ? (
        <label className="block text-sm text-zinc-950">
          <span className="text-zinc-950">Дата FF</span>
          <input
            type="datetime-local"
            className="mt-1 block rounded-md border border-zinc-200 px-3 py-2 text-zinc-950"
            value={ffStart}
            onChange={(e) => setFfStart(e.target.value)}
          />
        </label>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-950">
            <span className="text-zinc-950">Окно релиза (начало)</span>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-zinc-200 px-3 py-2 text-zinc-950"
              value={relStart}
              onChange={(e) => setRelStart(e.target.value)}
            />
          </label>
          <label className="block text-sm text-zinc-950">
            <span className="text-zinc-950">Окно релиза (конец)</span>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-zinc-200 px-3 py-2 text-zinc-950"
              value={relEnd}
              onChange={(e) => setRelEnd(e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void preview()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "…" : "Рассчитать"}
        </button>
        <button
          type="button"
          disabled={busy || stages.length === 0}
          onClick={() => void apply()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
        >
          Сохранить план
        </button>
      </div>

      {anchors ? (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-950">
          FF: {anchors.FF ? new Date(anchors.FF).toLocaleString() : "—"} · CF:{" "}
          {anchors.CF ? new Date(anchors.CF).toLocaleString() : "—"} · REL:{" "}
          {anchors.REL ? new Date(anchors.REL).toLocaleString() : "—"}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {stages.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs text-zinc-950">
                <th className="border-b py-2 pr-3">Этап</th>
                <th className="border-b py-2 pr-3">Suggested</th>
                <th className="border-b py-2 pr-3">Planned (редакт.)</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s, i) => (
                <tr key={s.stageCode}>
                  <td className="border-b border-zinc-100 py-2 pr-3">
                    <div className="font-medium text-zinc-950">{s.titleRu}</div>
                    <div className="text-xs text-zinc-950">{s.stageCode}</div>
                  </td>
                  <td className="border-b border-zinc-100 py-2 pr-3 text-xs text-zinc-950 tabular-nums">
                    {new Date(s.suggestedAt).toLocaleString()}
                  </td>
                  <td className="border-b border-zinc-100 py-2 pr-3">
                    <input
                      type="datetime-local"
                      className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-950"
                      value={toLocalInputValue(s.plannedAt)}
                      onChange={(e) => {
                        const iso = fromLocalInputValue(e.target.value);
                        if (!iso) return;
                        setStages((prev) => {
                          const next = [...prev];
                          next[i] = { ...next[i]!, plannedAt: iso };
                          return next;
                        });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
