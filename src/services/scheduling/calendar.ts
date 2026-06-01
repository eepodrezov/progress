import { WORK_HOURS, WORK_WEEKDAYS } from "@/config/scheduling";

/** Прибавить N календарных дней (выходные не исключаются) */
export function addCalendarDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Вычесть N календарных дней */
export function subCalendarDays(date: Date, days: number): Date {
  return addCalendarDays(date, -days);
}

export function isWorkWeekday(date: Date): boolean {
  const dow = date.getDay();
  return (WORK_WEEKDAYS as readonly number[]).includes(dow);
}

/** Нормализация при расчёте вперёд: 09:00; выходной → следующий Пн 09:00 */
export function normalizeToWorkStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(WORK_HOURS.startHour, 0, 0, 0);

  if (isWorkWeekday(d)) {
    return d;
  }

  const dow = d.getDay();
  const daysUntilMon = dow === 0 ? 1 : 8 - dow;
  d.setDate(d.getDate() + daysUntilMon);
  d.setHours(WORK_HOURS.startHour, 0, 0, 0);
  return d;
}

/**
 * Нормализация при расчёте назад: 09:00; выходной → предыдущая Пт 09:00
 * (не сдвигать вперёд на Пн — иначе все этапы схлопываются в одну дату)
 */
export function normalizeBackwardWorkStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(WORK_HOURS.startHour, 0, 0, 0);

  const dow = d.getDay();
  if (dow === 0) {
    d.setDate(d.getDate() - 2);
  } else if (dow === 6) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}
