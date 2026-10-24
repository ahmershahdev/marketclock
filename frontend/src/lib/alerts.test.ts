import { describe, expect, it } from "vitest";
import type { MarketHoliday } from "@/lib/api/types";
import { addDays, dueAlerts } from "./alerts";

function day(date: string, name: string, halfDay = false, closeTime: string | null = null) {
  return {
    date,
    name,
    category: halfDay ? "half_day" : "public",
    half_day: halfDay,
    close_time: closeTime,
  } satisfies MarketHoliday;
}

const HOLIDAYS = [
  day("2026-12-24", "Christmas Eve", true, "13:00"),
  day("2026-12-25", "Christmas Day"),
  day("2027-01-01", "New Year's Day"),
];

describe("watchlist alerts", () => {
  it("adds days across month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("alerts for today and tomorrow only", () => {
    const alerts = dueAlerts("XNYS", "2026-12-24", HOLIDAYS, new Set());

    expect(alerts).toEqual([
      {
        key: "XNYS:2026-12-24",
        title: "XNYS closes early today at 13:00",
        body: "Christmas Eve (2026-12-24)",
      },
      {
        key: "XNYS:2026-12-25",
        title: "XNYS is closed tomorrow",
        body: "Christmas Day (2026-12-25)",
      },
    ]);
  });

  it("skips alerts already sent", () => {
    const alerts = dueAlerts("XNYS", "2026-12-24", HOLIDAYS, new Set(["XNYS:2026-12-24"]));

    expect(alerts.map((alert) => alert.key)).toEqual(["XNYS:2026-12-25"]);
  });

  it("leaves out the close time when it is not known", () => {
    const alerts = dueAlerts(
      "XNZE",
      "2026-12-23",
      [day("2026-12-24", "Christmas Eve", true)],
      new Set(),
    );

    expect(alerts[0].title).toBe("XNZE closes early tomorrow");
  });

  it("says nothing on ordinary days", () => {
    expect(dueAlerts("XNYS", "2026-07-01", HOLIDAYS, new Set())).toEqual([]);
  });
});
