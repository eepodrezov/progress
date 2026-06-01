/** Ширина символа в моноширинной строке (эмодзи ≈ 2 ячейки) */
function charDisplayWidth(char: string): number {
  const cp = char.codePointAt(0)!;
  if (cp === 0xfe0f) return 0;
  if (cp >= 0x1f300 && cp <= 0x1faff) return 2;
  if (cp >= 0x2600 && cp <= 0x27bf) return 2;
  if (cp >= 0x2300 && cp <= 0x23ff) return 2;
  return 1;
}

export function displayWidth(value: string): number {
  let w = 0;
  for (const char of value) {
    w += charDisplayWidth(char);
  }
  return w;
}

export function padEndDisplay(value: string, width: number): string {
  const gap = width - displayWidth(value);
  if (gap <= 0) return value;
  return value + " ".repeat(gap);
}

export function padStartDisplay(value: string, width: number): string {
  const gap = width - displayWidth(value);
  if (gap <= 0) return value;
  return " ".repeat(gap) + value;
}

/** Фиксированные ширины колонок этапов в статус-отчёте */
export const STAGE_REPORT_CODE_COL = 10;
export const STAGE_REPORT_DATE_COL = 8;
export const STAGE_REPORT_EMOJI_COL = 2;

export function formatStageReportLine(
  code: string,
  date: string,
  emoji: string,
): string {
  return `${padEndDisplay(code, STAGE_REPORT_CODE_COL)}  ${padEndDisplay(date, STAGE_REPORT_DATE_COL)}  ${padStartDisplay(emoji, STAGE_REPORT_EMOJI_COL)}`;
}
