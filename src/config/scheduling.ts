import type { SchedulingFlags } from "@/services/scheduling/types";

export type StageDefinition = {
  stageCode: string;
  titleRu: string;
  /** Сдвиг в календарных днях от предыдущего этапа к этому */
  offsetDaysFromPrev: (flags: SchedulingFlags) => number;
};

export const WORK_HOURS = { startHour: 9, endHour: 18 } as const;

/** Пн–Пт */
export const WORK_WEEKDAYS = [1, 2, 3, 4, 5] as const;

/** Стартовые дни техокон (ночной релиз): Пн, Ср, Сб */
export const TECH_WINDOW_START_DAYS = [1, 3, 6] as const;

/**
 * Цепочка этапов (порядок важен).
 * Сдвиги — календарные дни (выходные не исключаются).
 */
export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    stageCode: "FF",
    titleRu: "Передача тестовых сборок на тестирование (Feature freeze)",
    offsetDaysFromPrev: () => 0,
  },
  {
    stageCode: "ZNO_DOCS",
    titleRu: "Формирование документов для ЗНО",
    offsetDaysFromPrev: (f) => (f.INT ? 4 : 2),
  },
  {
    stageCode: "ZNO_INIT",
    titleRu: "Создание ЗНО",
    offsetDaysFromPrev: () => 1,
  },
  {
    stageCode: "ZNO_DONE",
    titleRu: "Выполнение ЗНО",
    offsetDaysFromPrev: () => 1,
  },
  {
    stageCode: "ZNI_DOCS",
    titleRu: "Формирование документов для ЗНИ (Code freeze)",
    offsetDaysFromPrev: (f) => (f.PSY || f.NT ? 7 : 1),
  },
  {
    stageCode: "ZNI_INIT",
    titleRu: "Создание ЗНИ",
    offsetDaysFromPrev: () => 1,
  },
  {
    stageCode: "ZNI_DONE",
    titleRu: "Выполнение ЗНИ (дата релиза)",
    offsetDaysFromPrev: () => 2,
  },
];

/** Коды этапов, совпадающие с ключевыми датами релиза */
export const ANCHOR_STAGE_CODES = {
  FF: "FF",
  CF: "ZNI_DOCS",
  ZNI: "ZNI_INIT",
  REL: "ZNI_DONE",
} as const;

export function getStageDefinitions(): StageDefinition[] {
  return STAGE_DEFINITIONS;
}
