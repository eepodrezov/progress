/** Порог «можем опоздать»: осталось ≤ N календарных дней до planned_at */
export const AT_RISK_WITHIN_CALENDAR_DAYS = 1;

/** Час planned_at ≥ этого — конец дня (суффикс e) и ночное окно релиза */
export const END_OF_DAY_HOUR = 18;

export function getReleaseCompositionUrl(): string {
  return process.env.RELEASE_COMPOSITION_URL?.trim() ?? "";
}
