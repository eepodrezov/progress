import { TECH_WINDOW_START_DAYS, WORK_HOURS } from "@/config/scheduling";

/**
 * Сдвиг даты на ближайшее техокно (старт ночи релиза).
 * Правила:
 * - допустимые старты: Пн, Ср, Сб
 * - если попали на Вт → сдвиг на Ср
 * - если попали на Чт → сдвиг на Сб
 * - иначе → ближайший следующий старт (Пн/Ср/Сб)
 */
export function shiftToNextTechWindow(date: Date): Date {
  const d = new Date(date);
  let dow = d.getDay();

  let targetDow: number;
  if (dow === 2) {
    targetDow = 3;
  } else if (dow === 4) {
    targetDow = 6;
  } else if ((TECH_WINDOW_START_DAYS as readonly number[]).includes(dow)) {
    targetDow = dow;
  } else if (dow === 0) {
    targetDow = 1;
  } else if (dow === 5) {
    targetDow = 6;
  } else {
    targetDow = 1;
  }

  const diff = (targetDow - dow + 7) % 7;
  if (diff > 0) {
    d.setDate(d.getDate() + diff);
  }

  d.setHours(WORK_HOURS.startHour, 0, 0, 0);
  return d;
}
