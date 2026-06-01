import { AT_RISK_WITHIN_CALENDAR_DAYS } from "@/config/reports";

export type StageEmojiInput = {
  status: "planned" | "done" | "blocked" | "skipped";
  planned_at: string | null;
  actual_at: string | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function calendarDaysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function evaluateStageEmoji(
  stage: StageEmojiInput,
  now: Date = new Date(),
): string {
  if (stage.status === "skipped") return "⬇";
  if (stage.status === "blocked") return "🛑";

  if (stage.status === "done") {
    if (stage.planned_at && stage.actual_at) {
      const planned = new Date(stage.planned_at);
      const actual = new Date(stage.actual_at);
      if (
        !Number.isNaN(planned.getTime()) &&
        !Number.isNaN(actual.getTime()) &&
        actual.getTime() > planned.getTime()
      ) {
        return "☑️";
      }
    }
    return "✅";
  }

  if (stage.status === "planned") {
    if (stage.planned_at) {
      const planned = new Date(stage.planned_at);
      if (!Number.isNaN(planned.getTime())) {
        if (now.getTime() > planned.getTime()) return "🟥";
        const daysLeft = calendarDaysBetween(now, planned);
        if (daysLeft <= AT_RISK_WITHIN_CALENDAR_DAYS) return "🟧";
      }
    }
    return "🟩";
  }

  return "🟩";
}
