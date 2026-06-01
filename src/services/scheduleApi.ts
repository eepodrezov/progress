import { getStageDefinitions } from "@/config/scheduling";
import { calculateSchedule } from "@/services/scheduling/calcSchedule";
import type { SchedulingFlags, SchedulingMode } from "@/services/scheduling/types";

export function buildSchedulingInput(input: {
  mode: SchedulingMode;
  flags: SchedulingFlags;
  ffStartAt?: string;
  releaseWindowStartAt?: string;
  releaseWindowEndAt?: string;
}) {
  const defs = getStageDefinitions().map((d) => ({
    stageCode: d.stageCode,
    titleRu: d.titleRu,
    offsetDaysFromPrev: d.offsetDaysFromPrev,
  }));

  return {
    mode: input.mode,
    flags: input.flags,
    stageDefinitions: defs,
    ffStartAt: input.ffStartAt ? new Date(input.ffStartAt) : undefined,
    releaseWindowStartAt: input.releaseWindowStartAt
      ? new Date(input.releaseWindowStartAt)
      : undefined,
    releaseWindowEndAt: input.releaseWindowEndAt
      ? new Date(input.releaseWindowEndAt)
      : undefined,
  };
}

export function previewSchedule(input: Parameters<typeof buildSchedulingInput>[0]) {
  const schedulingInput = buildSchedulingInput(input);
  const result = calculateSchedule(schedulingInput);

  return {
    stages: result.stages.map((s) => ({
      stageCode: s.stageCode,
      titleRu: s.titleRu,
      suggestedAt: s.suggestedAt.toISOString(),
    })),
    anchors: {
      FF: result.anchors.FF.toISOString(),
      CF: result.anchors.CF.toISOString(),
      REL: result.anchors.REL.toISOString(),
    },
    stageDefinitions: defsToResponse(getStageDefinitions()),
  };
}

function defsToResponse(
  defs: ReturnType<typeof getStageDefinitions>,
) {
  return defs.map((d) => ({
    stageCode: d.stageCode,
    titleRu: d.titleRu,
  }));
}
