"use client";

import { useEffect, useMemo, useState } from "react";

type ApiError = { error: string };

type ReleaseMilestoneRow = {
  id: string;
  release_id: string;
  template_id: string;
  planned_at: string | null;
  status: "planned" | "done" | "blocked" | "skipped";
  actual_at: string | null;
  delay_reason: string | null;
  template_code: string;
  template_title: string;
  template_sort_order: number;
};

function asErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as any).message;
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
  // браузер дает "YYYY-MM-DDTHH:mm"
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function ReleaseMilestonesClient(props: { releaseId: string }) {
  const [items, setItems] = useState<ReleaseMilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initBusy, setInitBusy] = useState(false);

  const hasAny = items.length > 0;

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((x) => x.status === "done").length;
    const blocked = items.filter((x) => x.status === "blocked").length;
    const skipped = items.filter((x) => x.status === "skipped").length;
    const planned = items.filter((x) => x.status === "planned").length;
    return { total, done, blocked, skipped, planned };
  }, [items]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/release-milestones/by-release/${props.releaseId}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as { items?: ReleaseMilestoneRow[] } & ApiError;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.releaseId]);

  async function initDefault() {
    setInitBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/release-milestones/init", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ releaseId: props.releaseId }),
      });
      const json = (await res.json()) as { ok?: boolean } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setInitBusy(false);
    }
  }

  async function patchRow(
    id: string,
    patch: Partial<{
      plannedAt: string | null;
      status: ReleaseMilestoneRow["status"];
      actualAt: string | null;
      delayReason: string | null;
    }>,
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/release-milestones/${id}`, {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-zinc-900">
          Контрольные точки
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-600">
            Total: {stats.total} · Planned: {stats.planned} · Done: {stats.done} ·
            Blocked: {stats.blocked} · Skipped: {stats.skipped}
          </div>
          <button
            onClick={initDefault}
            disabled={initBusy}
            className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {initBusy ? "Инициализация..." : "Инициализировать КТ"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-zinc-600">Загрузка...</div>
      ) : !hasAny ? (
        <div className="text-sm text-zinc-600">
          Пока нет контрольных точек. Нажми “Инициализировать КТ”.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs text-zinc-600">
                <th className="border-b border-zinc-200 py-2 pr-3">Milestone</th>
                <th className="border-b border-zinc-200 py-2 pr-3">Planned</th>
                <th className="border-b border-zinc-200 py-2 pr-3">Status</th>
                <th className="border-b border-zinc-200 py-2 pr-3">Actual</th>
                <th className="border-b border-zinc-200 py-2 pr-3">Reason</th>
                <th className="border-b border-zinc-200 py-2 pr-3">Save</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <Row
                  key={m.id}
                  item={m}
                  busy={busyId === m.id}
                  onSave={patchRow}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row(props: {
  item: ReleaseMilestoneRow;
  busy: boolean;
  onSave: (
    id: string,
    patch: Partial<{
      plannedAt: string | null;
      status: ReleaseMilestoneRow["status"];
      actualAt: string | null;
      delayReason: string | null;
    }>,
  ) => Promise<void>;
}) {
  const [planned, setPlanned] = useState(() => toLocalInputValue(props.item.planned_at));
  const [status, setStatus] = useState<ReleaseMilestoneRow["status"]>(props.item.status);
  const [actual, setActual] = useState(() => toLocalInputValue(props.item.actual_at));
  const [reason, setReason] = useState(props.item.delay_reason ?? "");

  useEffect(() => {
    setPlanned(toLocalInputValue(props.item.planned_at));
    setStatus(props.item.status);
    setActual(toLocalInputValue(props.item.actual_at));
    setReason(props.item.delay_reason ?? "");
  }, [props.item]);

  const saveDisabled = props.busy;

  const save = async () => {
    await props.onSave(props.item.id, {
      plannedAt: fromLocalInputValue(planned),
      status,
      actualAt: fromLocalInputValue(actual),
      delayReason: reason.trim() || null,
    });
  };

  return (
    <tr className="align-top">
      <td className="border-b border-zinc-100 py-3 pr-3">
        <div className="font-medium text-zinc-900">{props.item.template_title}</div>
        <div className="text-xs text-zinc-500">{props.item.template_code}</div>
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <input
          type="datetime-local"
          className="w-[220px] rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-400"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
        />
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <select
          className="w-[140px] rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-400"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
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
          className="w-[220px] rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-400"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <input
          className="w-[320px] rounded-md border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-zinc-400"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Причина задержки/блокировки (если нужно)"
        />
        {status === "blocked" && !reason.trim() ? (
          <div className="mt-1 text-[11px] text-red-600">
            Для status=blocked нужен reason.
          </div>
        ) : null}
      </td>
      <td className="border-b border-zinc-100 py-3 pr-3">
        <button
          onClick={save}
          disabled={saveDisabled || (status === "blocked" && !reason.trim())}
          className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {props.busy ? "..." : "Save"}
        </button>
      </td>
    </tr>
  );
}

