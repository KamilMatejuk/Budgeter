import { ChartRange } from "@/types/enum";

export function getDateString(date: Date | string): string {
  return new Date(date).toLocaleDateString("pl-PL");
}

export function getMonthName(month: number) {
  const date = new Date(1970, 0, 1);
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
}

function _startDateFromRange(range: ChartRange | keyof typeof ChartRange): Date | undefined {
  const now = new Date();
  if (range == ChartRange["3M"]) {
    return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  } else if (range == ChartRange["1Y"]) {
    return new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
  } else {
    return undefined;
  }
}

function _getDaysSinceDate(start: Date): string[] {
  const dates: string[] = [];
  const now = new Date();
  while (start <= now) {
    dates.push(getDateString(start));
    start.setDate(start.getDate() + 1);
  }
  return dates;
}

function _getMonthsSinceDate(start: Date): string[] {
  const months: string[] = [];
  const now = new Date();
  while (start <= now) {
    months.push(getMonthName(start.getMonth() + 1) + ' ' + start.getFullYear());
    start.setMonth(start.getMonth() + 1);
  }
  return months;
}

export function getDaysInRange(range: ChartRange | keyof typeof ChartRange): string[] {
  const start = _startDateFromRange(range);
  if (!start) return [];
  return _getDaysSinceDate(start);
}

export function getDaysFromValues(values: number[]){
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - values.length + 1);
  return _getDaysSinceDate(start);
}

export function getMonthsInRange(range: ChartRange | keyof typeof ChartRange): string[] {
  const start = _startDateFromRange(range);
  if (!start) return [];
  return _getMonthsSinceDate(start);
}

export function getMonthsFromValues(values: number[]){
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - values.length + 1, 1);
  return _getMonthsSinceDate(start);
}
