export type SchedulingFlags = {
  INT: boolean;
  PSY: boolean;
  NT: boolean;
};

export type SchedulingMode = "fromFF" | "fromREL";

export type StageDefinitionInput = {
  stageCode: string;
  titleRu: string;
  offsetDaysFromPrev: (flags: SchedulingFlags) => number;
};

export type SchedulingInput = {
  mode: SchedulingMode;
  flags: SchedulingFlags;
  stageDefinitions: StageDefinitionInput[];
  /** Режим fromFF: дата FF */
  ffStartAt?: Date;
  /** Режим fromREL: окно релиза (ночь) */
  releaseWindowStartAt?: Date;
  releaseWindowEndAt?: Date;
};

export type ScheduledStage = {
  stageCode: string;
  titleRu: string;
  suggestedAt: Date;
};

export type SchedulingOutput = {
  stages: ScheduledStage[];
  anchors: {
    FF: Date;
    CF: Date;
    REL: Date;
  };
};
