"use client";

import { useEffect, useState } from "react";

type ApiError = { error: string };

type ReleaseStageRow = {
  id: string;
  stage_code: string;
  title_ru: string;
  suggested_at: string | null;
  planned_at: string | null;
  status: "planned" | "done" | "blocked" | "skipped";
  actual_at: string | null;
  delay_reason: string | null;
};

function asErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
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

function StageDoneIcon() {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
      title="Этап завершён"
      aria-hidden
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.5a1 1 0 0 1-1.435.02L3.29 9.964a1 1 0 1 1 1.42-1.408l3.776 3.865 6.53-6.75a1 1 0 0 1 1.438-.02Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export function ReleaseStagesClient(props: { releaseId: string }) {
  const [items, setItems] = useState<ReleaseStageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/releases/${props.releaseId}/stages`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { items?: ReleaseStageRow[] } & ApiError;
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
  }, [props.releaseId]);

  async function patchRow(
    id: string,
    patch: Partial<{
      plannedAt: string | null;
      status: ReleaseStageRow["status"];
      actualAt: string | null;
      delayReason: string | null;
    }>,
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/release-stages/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json()) as { ok?: boolean } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-zinc-950">Загрузка этапов…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-zinc-950">
        Этапы ещё не сохранены. Выполните расчёт и нажмите «Сохранить план» в блоке
        планирования.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-zinc-950">Этапы релиза (факт)</div>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="text-xs text-zinc-950">
              <th className="border-b py-2 pr-3">Этап</th>
              <th className="border-b py-2 pr-3">Suggested</th>
              <th className="border-b py-2 pr-3">Planned</th>
              <th className="border-b py-2 pr-3">Status</th>
              <th className="border-b py-2 pr-3">Actual</th>
              <th className="border-b py-2 pr-3">Reason</th>
              <th className="border-b py-2 pr-3">Save</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <StageRow
                key={row.id}
                row={row}
                busy={busyId === row.id}
                onSave={patchRow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StageRow(props: {
  row: ReleaseStageRow;
  busy: boolean;
  onSave: (
    id: string,
    patch: Partial<{
      plannedAt: string | null;
      status: ReleaseStageRow["status"];
      actualAt: string | null;
      delayReason: string | null;
    }>,
  ) => Promise<void>;
}) {
  const [planned, setPlanned] = useState(() =>
    toLocalInputValue(props.row.planned_at),
  );
  const [status, setStatus] = useState(props.row.status);
  const [actual, setActual] = useState(() =>
    toLocalInputValue(props.row.actual_at),
  );
  const [reason, setReason] = useState(props.row.delay_reason ?? "");

  useEffect(() => {
    setPlanned(toLocalInputValue(props.row.planned_at));
    setStatus(props.row.status);
    setActual(toLocalInputValue(props.row.actual_at));
    setReason(props.row.delay_reason ?? "");
  }, [props.row]);

  const isDone = status === "done";

  return (
    <tr
      className={`align-top ${isDone ? "bg-emerald-50/60" : ""}`}
    >
      <td className="border-b border-zinc-100 py-3 pr-3">
        <div className="flex items-start gap-2">
          {isDone ? <StageDoneIcon /> : <span className="inline-block h-5 w-5 shrink-0" aria-hidden />}
          <div className="min-w-0">
            <div className="font-medium text-zinc-950">{props.row.title_ru}</div>
            <div className="text-xs text-zinc-600">{props.row.stage_code}</div>
          </div>
        </div>
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3 text-xs text-zinc-950">
        {props.row.suggested_at
          ? new Date(props.row.suggested_at).toLocaleString()
          : "—"}
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <input
          type="datetime-local"
          className="w-[200px] rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-950"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
        />
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <select
          className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-950"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ReleaseStageRow["status"])
          }
        >
          <option value="planned">planned</option>
          <option value="done">done</option>
          <option value="blocked">blocked</option>
          <option value="skipped">skipped</option>
        </select>
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <input
          type="datetime-local"
          className="w-[200px] rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-950"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <input
          className="w-[240px] rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-950"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <button
          type="button"
          disabled={props.busy || (status === "blocked" && !reason.trim())}
          onClick={() =>
            void props.onSave(props.row.id, {
              plannedAt: fromLocalInputValue(planned),
              status,
              actualAt: fromLocalInputValue(actual),
              delayReason: reason.trim() || null,
            })
          }
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {props.busy ? "…" : "Save"}
        </button>
      </td>
    </tr>
  );
}
