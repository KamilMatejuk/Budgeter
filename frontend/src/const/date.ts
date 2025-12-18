export function getDateString(date: Date | string): string {
  return new Date(date).toLocaleDateString("pl-PL");
}

export function getMonthName(month: number) {
  const date = new Date(1970, 0, 1);
  date.setMonth(month - 1);
  return date.toLocaleString('default', { month: 'long' });
}
