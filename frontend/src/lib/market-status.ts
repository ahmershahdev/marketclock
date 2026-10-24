import type { MarketStatus } from "@/lib/api/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function duration(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(rest).padStart(2, "0")}m`;
  return `${rest}m`;
}

// The API sends local exchange time with its offset, so the wall-clock part is read as written.
function localWallClock(iso: string): string {
  const [day, time] = iso.split("T");
  const weekday = WEEKDAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
  return `${weekday} ${time.slice(0, 5)}`;
}

export type StatusTone = "open" | "early" | "closed" | "unknown";

export function statusLabel(status: MarketStatus, now: number): { tone: StatusTone; text: string } {
  if (status.state === "hours_unknown") {
    return { tone: "unknown", text: "Trading day · hours not on file" };
  }
  if (status.state === "open" && status.closes_at) {
    const left = duration(Date.parse(status.closes_at) - now);
    return status.detail === "early_close"
      ? { tone: "early", text: `Open, early close · closes in ${left}` }
      : { tone: "open", text: `Open · closes in ${left}` };
  }
  const reason =
    status.detail === "weekend" ? " (weekend)" : status.detail === "holiday" ? " (holiday)" : "";
  if (!status.opens_at) return { tone: "closed", text: `Closed${reason}` };
  const until = Date.parse(status.opens_at) - now;
  const when =
    until < 24 * 3600 * 1000
      ? `opens in ${duration(until)}`
      : `opens ${localWallClock(status.opens_at)}`;
  return { tone: "closed", text: `Closed${reason} · ${when}` };
}

export const TONE_CLASS: Record<StatusTone, string> = {
  open: "border-open/50 text-open",
  early: "border-early/50 text-early",
  closed: "border-closed/50 text-closed",
  unknown: "border-rule-strong text-ink-2",
};

export const TONE_DOT: Record<StatusTone, string> = {
  open: "bg-open",
  early: "bg-early",
  closed: "bg-closed",
  unknown: "bg-ink-3",
};
