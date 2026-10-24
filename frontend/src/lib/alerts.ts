import type { MarketHoliday } from "@/lib/api/types";

export const ALERTS_KEY = "watchlist-alerts";
export const SENT_KEY = "watchlist-alerts-sent";
export const ALERTS_EVENT = "marketclock:alerts";

export interface Alert {
  key: string;
  title: string;
  body: string;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function dueAlerts(
  code: string,
  today: string,
  holidays: readonly MarketHoliday[],
  sent: ReadonlySet<string>,
): Alert[] {
  const tomorrow = addDays(today, 1);
  return holidays
    .filter((holiday) => holiday.date === today || holiday.date === tomorrow)
    .map((holiday) => {
      const when = holiday.date === today ? "today" : "tomorrow";
      const what = holiday.half_day
        ? `closes early ${when}${holiday.close_time ? ` at ${holiday.close_time}` : ""}`
        : `is closed ${when}`;
      return {
        key: `${code}:${holiday.date}`,
        title: `${code} ${what}`,
        body: `${holiday.name} (${holiday.date})`,
      };
    })
    .filter((alert) => !sent.has(alert.key));
}

export function readSent(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

export function rememberSent(keys: readonly string[], today: string) {
  // Keys end in their date, so anything before yesterday can be dropped.
  const keep = [...readSent(), ...keys].filter((key) => key.slice(-10) >= addDays(today, -1));
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify([...new Set(keep)]));
  } catch {
    return;
  }
}

export function alertsEnabled(): boolean {
  try {
    return localStorage.getItem(ALERTS_KEY) === "on";
  } catch {
    return false;
  }
}

export function setAlertsEnabled(on: boolean) {
  try {
    if (on) localStorage.setItem(ALERTS_KEY, "on");
    else localStorage.removeItem(ALERTS_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(ALERTS_EVENT));
}
