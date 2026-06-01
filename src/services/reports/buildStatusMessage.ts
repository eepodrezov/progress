import { getReleaseCompositionUrl } from "@/config/reports";
import { deriveCurrentStageTitle, sortStagesByDefinition } from "./deriveCurrentStageTitle";
import { evaluateStageEmoji } from "./evaluateStageEmoji";
import { formatStageReportLine } from "./alignText";
import {
  formatPlannedAtLine,
  formatReleaseDateRange,
} from "./formatPlannedDate";
import type { ReleaseRow } from "@/services/releases";
import type { ReleaseStageRow } from "@/services/releaseStages";

const HEADER = `📈☑️    Статус релизов    ✅🚀
                      🟩🟧🟥`;

function buildFooter(): string {
  const url = getReleaseCompositionUrl();
  if (url) {
    return `=> [СОСТАВ РЕЛИЗОВ](${url}) <=`;
  }
  return "=> СОСТАВ РЕЛИЗОВ <=";
}

/** Ровные колонки: stage_code | дата | эмодзи (monospace + учёт ширины эмодзи) */
function formatAlignedStageLines(stages: ReleaseStageRow[]): string[] {
  return stages.map((stage) =>
    formatStageReportLine(
      stage.stage_code,
      formatPlannedAtLine(stage.planned_at),
      evaluateStageEmoji(stage),
    ),
  );
}

function releaseHeaderLines(
  release: ReleaseRow,
  sorted: ReleaseStageRow[],
): string[] {
  return [
    release.title,
    `Дата релиза: ${formatReleaseDateRange(release.release_date, sorted)}`,
    `Текущий статус: ${deriveCurrentStageTitle(sorted)}`,
    "",
  ];
}

function formatReleaseBlock(
  release: ReleaseRow,
  stages: ReleaseStageRow[],
): string {
  const sorted = sortStagesByDefinition(stages);
  return [
    ...releaseHeaderLines(release, sorted),
    ...formatAlignedStageLines(sorted),
  ].join("\n");
}

/** Таблица этапов в ``` — в Telegram рендерится моноширинным шрифтом */
function formatReleaseBlockForTelegram(
  release: ReleaseRow,
  stages: ReleaseStageRow[],
): string {
  const sorted = sortStagesByDefinition(stages);
  const stageLines = formatAlignedStageLines(sorted);
  return [
    ...releaseHeaderLines(release, sorted),
    "```",
    ...stageLines,
    "```",
  ].join("\n");
}

export function buildStatusMessage(input: {
  releases: ReleaseRow[];
  stagesByReleaseId: Map<string, ReleaseStageRow[]>;
}): { text: string; telegramText: string; releaseCount: number } {
  const previewBlocks: string[] = [HEADER, ""];
  const telegramBlocks: string[] = [HEADER, ""];

  let count = 0;
  for (const release of input.releases) {
    const stages = input.stagesByReleaseId.get(release.id);
    if (!stages || stages.length === 0) continue;

    if (count > 0) {
      previewBlocks.push("");
      telegramBlocks.push("");
    }
    previewBlocks.push(formatReleaseBlock(release, stages));
    telegramBlocks.push(formatReleaseBlockForTelegram(release, stages));
    count++;
  }

  if (count > 0) {
    const footer = buildFooter();
    previewBlocks.push("", footer);
    telegramBlocks.push("", footer);
  }

  return {
    text: previewBlocks.join("\n"),
    telegramText: telegramBlocks.join("\n"),
    releaseCount: count,
  };
}

export async function generateStatusMessage(): Promise<{
  text: string;
  telegramText: string;
  releaseCount: number;
}> {
  const { listReleasesForStatusReport } = await import("@/services/releases");
  const { listStagesForReleaseIds } = await import("@/services/releaseStages");

  const releases = await listReleasesForStatusReport();
  if (releases.length === 0) {
    const empty = `${HEADER}\n\n(нет релизов для отчёта)`;
    return { text: empty, telegramText: empty, releaseCount: 0 };
  }

  const ids = releases.map((r) => r.id);
  const allStages = await listStagesForReleaseIds(ids);
  const stagesByReleaseId = new Map<string, ReleaseStageRow[]>();

  for (const stage of allStages) {
    const list = stagesByReleaseId.get(stage.release_id) ?? [];
    list.push(stage);
    stagesByReleaseId.set(stage.release_id, list);
  }

  return buildStatusMessage({ releases, stagesByReleaseId });
}
