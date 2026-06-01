"use client";

import { useEffect, useMemo, useState } from "react";

type ApiError = { error: string };

type ReleaseTaskRow = {
  id: string;
  release_id: string;
  title: string;
  hours: string;
  created_at: string;
};

type StackRow = {
  id: string;
  code: string;
  title: string;
};

function asErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as any).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

export function ReleaseInputsClient(props: { releaseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState<ReleaseTaskRow[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskHours, setTaskHours] = useState("1");
  const [taskBusy, setTaskBusy] = useState(false);
  const [taskDeleteBusyId, setTaskDeleteBusyId] = useState<string | null>(null);

  const [stacks, setStacks] = useState<StackRow[]>([]);
  const [selectedStackIds, setSelectedStackIds] = useState<string[]>([]);
  const [stacksBusy, setStacksBusy] = useState(false);

  const totalHours = useMemo(() => {
    const sum = tasks.reduce((acc, t) => acc + (Number(t.hours) || 0), 0);
    return Math.round(sum * 100) / 100;
  }, [tasks]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, stacksRes, selectedRes] = await Promise.all([
        fetch(`/api/releases/${props.releaseId}/tasks`, { cache: "no-store" }),
        fetch(`/api/stacks`, { cache: "no-store" }),
        fetch(`/api/releases/${props.releaseId}/stacks`, { cache: "no-store" }),
      ]);

      const tasksJson = (await tasksRes.json()) as
        | { items?: ReleaseTaskRow[] }
        | ApiError;
      const stacksJson = (await stacksRes.json()) as
        | { items?: StackRow[] }
        | ApiError;
      const selectedJson = (await selectedRes.json()) as
        | { stackIds?: string[] }
        | ApiError;

      if (!tasksRes.ok)
        throw new Error(
          (tasksJson as ApiError).error || `HTTP ${tasksRes.status}`,
        );
      if (!stacksRes.ok)
        throw new Error(
          (stacksJson as ApiError).error || `HTTP ${stacksRes.status}`,
        );
      if (!selectedRes.ok)
        throw new Error(
          (selectedJson as ApiError).error || `HTTP ${selectedRes.status}`,
        );

      setTasks((tasksJson as any).items ?? []);
      setStacks((stacksJson as any).items ?? []);
      setSelectedStackIds((selectedJson as any).stackIds ?? []);
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.releaseId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(taskHours);
    if (!taskTitle.trim() || !Number.isFinite(hours) || hours < 0) return;

    setTaskBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/releases/${props.releaseId}/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: taskTitle, hours }),
      });
      const json = (await res.json()) as { item?: ReleaseTaskRow } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setTaskTitle("");
      setTaskHours("1");
      await loadAll();
    } catch (e2) {
      setError(asErrorMessage(e2));
    } finally {
      setTaskBusy(false);
    }
  }

  async function deleteTask(id: string) {
    setTaskDeleteBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      await loadAll();
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setTaskDeleteBusyId(null);
    }
  }

  function toggleStack(id: string) {
    setSelectedStackIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function saveStacks() {
    setStacksBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/releases/${props.releaseId}/stacks`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stackIds: selectedStackIds }),
      });
      const json = (await res.json()) as { ok?: boolean } & ApiError;
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      await loadAll();
    } catch (e) {
      setError(asErrorMessage(e));
    } finally {
      setStacksBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-zinc-950">Загрузка параметров релиза…</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-950">
            Данные релиза (задачи и стеки)
          </div>
          <div className="mt-1 text-xs text-zinc-950">
            Total task hours: <span className="font-medium">{totalHours}</span> ·
            Stacks: <span className="font-medium">{selectedStackIds.length}</span>
          </div>
        </div>
        <button
          onClick={saveStacks}
          disabled={stacksBusy}
          className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {stacksBusy ? "Сохраняю…" : "Сохранить стеки"}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-medium text-zinc-950">Задачи релиза</div>
          <form onSubmit={addTask} className="flex flex-wrap gap-2">
            <input
              className="min-w-[220px] flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-400"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Например: Feature X"
            />
            <input
              className="w-[110px] rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-400"
              value={taskHours}
              onChange={(e) => setTaskHours(e.target.value)}
              inputMode="decimal"
              placeholder="hours"
            />
            <button
              type="submit"
              disabled={taskBusy || !taskTitle.trim()}
              className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {taskBusy ? "…" : "Добавить"}
            </button>
          </form>

          {tasks.length === 0 ? (
            <div className="text-sm text-zinc-950">Пока нет задач.</div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-950">
                      {t.title}
                    </div>
                    <div className="text-xs text-zinc-950">{t.hours} h</div>
                  </div>
                  <button
                    onClick={() => void deleteTask(t.id)}
                    disabled={taskDeleteBusyId === t.id}
                    className="shrink-0 text-xs font-medium text-zinc-950 underline disabled:opacity-50"
                  >
                    {taskDeleteBusyId === t.id ? "Удаляю…" : "Удалить"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-zinc-950">Стеки</div>
          {stacks.length === 0 ? (
            <div className="text-sm text-zinc-950">
              Пока нет стеков. Можно добавить через `POST /api/stacks`.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {stacks.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-zinc-200 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={selectedStackIds.includes(s.id)}
                    onChange={() => toggleStack(s.id)}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-950">
                      {s.title}
                    </div>
                    <div className="text-xs text-zinc-950">{s.code}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-950">
            Примечание: сейчас стеки сохраняются кнопкой “Сохранить стеки”.
          </div>
        </div>
      </div>
    </div>
  );
}

