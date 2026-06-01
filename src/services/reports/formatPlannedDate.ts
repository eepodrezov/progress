import { END_OF_DAY_HOUR } from "@/config/reports";
import { ANCHOR_STAGE_CODES } from "@/config/scheduling";
import type { ReleaseStageRow } from "@/services/releaseStages";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDayMonth(d: Date): string {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
}

/** DD.MM + s | e из planned_at */
export function formatPlannedAtLine(plannedAt: string | null): string {
  if (!plannedAt) return "—";
  const d = new Date(plannedAt);
  if (Number.isNaN(d.getTime())) return "—";
  const suffix = d.getHours() >= END_OF_DAY_HOUR ? "e" : "s";
  return `${formatDayMonth(d)}${suffix}`;
}

function formatDayDayMonth(start: Date, end: Date): string {
  const mm = pad2(end.getMonth() + 1);
  return `${pad2(start.getDate())}-${pad2(end.getDate())}.${mm}`;
}

function rangeFromDate(d: Date, twoDayWindow: boolean): string {
  if (twoDayWindow) {
    const start = new Date(d);
    start.setDate(start.getDate() - 1);
    return formatDayDayMonth(start, d);
  }
  return formatDayDayMonth(d, d);
}

/** DD-DD.MM для строки «Дата релиза» */
export function formatReleaseDateRange(
  releaseDate: string | null,
  stages: ReleaseStageRow[],
): string {
  const zniDone = stages.find((s) => s.stage_code === ANCHOR_STAGE_CODES.REL);

  if (zniDone?.planned_at) {
    const d = new Date(zniDone.planned_at);
    if (!Number.isNaN(d.getTime())) {
      return rangeFromDate(d, d.getHours() >= END_OF_DAY_HOUR);
    }
  }

  if (releaseDate && /^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    const [y, m, day] = releaseDate.split("-").map(Number);
    const d = new Date(y, m - 1, day);
    if (!Number.isNaN(d.getTime())) {
      return formatDayDayMonth(d, d);
    }
  }

  return "—";
}
