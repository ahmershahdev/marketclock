export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

// UTC on purpose: local time shifts dates near midnight.
export function weekdayOf(iso: string): Weekday {
  const [y, m, d] = iso.split("-").map(Number);
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) as Weekday;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthWeeks(year: number, month: number): (string | null)[][] {
  const first = isoDate(year, month, 1);
  const cells: (string | null)[] = Array.from({ length: weekdayOf(first) }, () => null);
  for (let day = 1; day <= daysInMonth(year, month); day++) {
    cells.push(isoDate(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function weekendLabel(weekend: readonly number[]): string {
  return weekend.map((day) => WEEKDAY_SHORT[day] ?? "?").join(" + ");
}

export function todayIn(timeZone: string, epoch: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(epoch);
}

export type DayKind = "open" | "weekend" | "closed" | "early";

export function dayKind(
  iso: string,
  weekend: readonly number[],
  closures: ReadonlyMap<string, { halfDay: boolean }>,
): DayKind {
  const closure = closures.get(iso);
  if (closure) return closure.halfDay ? "early" : "closed";
  if (weekend.includes(weekdayOf(iso))) return "weekend";
  return "open";
}
