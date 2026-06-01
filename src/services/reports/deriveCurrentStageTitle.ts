import { STAGE_DEFINITIONS } from "@/config/scheduling";
import type { ReleaseStageRow } from "@/services/releaseStages";

const STAGE_ORDER = STAGE_DEFINITIONS.map((d) => d.stageCode);

export function sortStagesByDefinition(stages: ReleaseStageRow[]): ReleaseStageRow[] {
  const order = new Map(STAGE_ORDER.map((code, i) => [code, i]));
  return [...stages].sort((a, b) => {
    const ia = order.get(a.stage_code) ?? 999;
    const ib = order.get(b.stage_code) ?? 999;
    return ia - ib;
  });
}

export function deriveCurrentStageTitle(stages: ReleaseStageRow[]): string {
  const sorted = sortStagesByDefinition(stages);
  const current = sorted.find(
    (s) => s.status !== "done" && s.status !== "skipped",
  );
  return current?.title_ru ?? "Все этапы завершены";
}
