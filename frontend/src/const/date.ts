import { ChartRange } from "@/types/enum";

export function getISODateString(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}`;
}

export function getDateString(date: Date | string): string {
  return new Date(date).toLocaleDateString("pl-PL");
}

export function getDateTimeString(date: Date | string): string {
  return new Date(date).toLocaleDateString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function getMonthName(month: number) {
  const date = new Date(1970, 0, 1);
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
}

export function getDaysBetweenDates(start: Date, end: Date): number {
  const oneDay = 1000 * 60 * 60 * 24;
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffInTime = endDate.getTime() - startDate.getTime();
  return Math.round(diffInTime / oneDay);
}

export function getMonthsBetweenDates(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
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

export function _getMonthsSinceDate(start: Date): string[] {
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

export function getDaysFromValues(values: number[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - values.length + 1);
  return _getDaysSinceDate(start);
}

export function getMonthsInRange(range: ChartRange | keyof typeof ChartRange): string[] {
  const start = _startDateFromRange(range);
  if (!start) return [];
  return _getMonthsSinceDate(start);
}

export function getMonthsFromValues(values: number[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - values.length + 1, 1);
  return _getMonthsSinceDate(start);
}

export function getMonthsArray(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(getMonthName(date.getMonth() + 1) + ' ' + date.getFullYear());
  }
  return months;
}
