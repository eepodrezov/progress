import { ANCHOR_STAGE_CODES } from "@/config/scheduling";
import {
  addCalendarDays,
  normalizeBackwardWorkStart,
  normalizeToWorkStart,
  subCalendarDays,
} from "./calendar";
import { shiftToNextTechWindow } from "./techWindows";
import type {
  SchedulingInput,
  SchedulingOutput,
  ScheduledStage,
  StageDefinitionInput,
} from "./types";

function getOffsets(defs: StageDefinitionInput[], flags: SchedulingInput["flags"]) {
  return defs.map((d) => d.offsetDaysFromPrev(flags));
}

/** Расчёт вперёд от FF */
export function calcForwardFromFF(input: SchedulingInput): SchedulingOutput {
  const defs = input.stageDefinitions;
  if (!input.ffStartAt) {
    throw new Error("ffStartAt is required for fromFF mode");
  }

  const offsets = getOffsets(defs, input.flags);
  const dates: Date[] = [];
  dates[0] = normalizeToWorkStart(new Date(input.ffStartAt));

  for (let i = 1; i < defs.length; i++) {
    dates[i] = addCalendarDays(dates[i - 1]!, offsets[i]!);
    dates[i] = normalizeToWorkStart(dates[i]!);
  }

  // Техокно для ZNI_DONE (REL)
  const zniDoneIdx = defs.findIndex((d) => d.stageCode === ANCHOR_STAGE_CODES.REL);
  if (zniDoneIdx >= 0) {
    dates[zniDoneIdx] = shiftToNextTechWindow(dates[zniDoneIdx]!);
  }

  const stages: ScheduledStage[] = defs.map((def, i) => ({
    stageCode: def.stageCode,
    titleRu: def.titleRu,
    suggestedAt: dates[i]!,
  }));

  const ff = dates[0]!;
  const cfIdx = defs.findIndex((d) => d.stageCode === ANCHOR_STAGE_CODES.CF);
  const relIdx = defs.findIndex((d) => d.stageCode === ANCHOR_STAGE_CODES.REL);

  return {
    stages,
    anchors: {
      FF: ff,
      CF: dates[cfIdx >= 0 ? cfIdx : 0]!,
      REL: dates[relIdx >= 0 ? relIdx : dates.length - 1]!,
    },
  };
}

/** Расчёт назад от окна релиза (ZNI_DONE = конец окна) */
export function calcBackwardFromREL(input: SchedulingInput): SchedulingOutput {
  const defs = input.stageDefinitions;
  const anchor =
    input.releaseWindowEndAt ?? input.releaseWindowStartAt;
  if (!anchor) {
    throw new Error(
      "releaseWindowStartAt or releaseWindowEndAt is required for fromREL mode",
    );
  }

  const offsets = getOffsets(defs, input.flags);
  const n = defs.length;
  const dates: Date[] = new Array(n);
  // Якорь релиза (ZNI_DONE): сохраняем дату/время окна, как задал пользователь
  dates[n - 1] = new Date(anchor);

  for (let i = n - 2; i >= 0; i--) {
    dates[i] = subCalendarDays(dates[i + 1]!, offsets[i + 1]!);
    dates[i] = normalizeBackwardWorkStart(dates[i]!);
  }

  const stages: ScheduledStage[] = defs.map((def, i) => ({
    stageCode: def.stageCode,
    titleRu: def.titleRu,
    suggestedAt: dates[i]!,
  }));

  const ff = dates[0]!;
  const cfIdx = defs.findIndex((d) => d.stageCode === ANCHOR_STAGE_CODES.CF);
  const relIdx = defs.findIndex((d) => d.stageCode === ANCHOR_STAGE_CODES.REL);

  return {
    stages,
    anchors: {
      FF: ff,
      CF: dates[cfIdx >= 0 ? cfIdx : 0]!,
      REL: dates[relIdx >= 0 ? relIdx : n - 1]!,
    },
  };
}

export function calculateSchedule(input: SchedulingInput): SchedulingOutput {
  if (input.mode === "fromFF") {
    return calcForwardFromFF(input);
  }
  return calcBackwardFromREL(input);
}
