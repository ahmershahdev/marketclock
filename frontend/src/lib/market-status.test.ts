import { describe, expect, it } from "vitest";
import type { MarketStatus } from "@/lib/api/types";
import { duration, statusLabel } from "./market-status";

const NOW = Date.parse("2026-12-24T16:00:00Z");

function status(partial: Partial<MarketStatus>): MarketStatus {
  return {
    market: "XNYS",
    state: "closed",
    detail: "regular",
    local_time: "2026-12-24T11:00:00-05:00",
    closes_at: null,
    opens_at: null,
    ...partial,
  };
}

describe("market status label", () => {
  it("formats durations", () => {
    expect(duration(30 * 1000)).toBe("1m");
    expect(duration(45 * 60000)).toBe("45m");
    expect(duration(130 * 60000)).toBe("2h 10m");
    expect(duration((3 * 1440 + 125) * 60000)).toBe("3d 2h");
  });

  it("counts down to the close, early or regular", () => {
    const open = status({ state: "open", closes_at: "2026-12-24T13:00:00-05:00" });
    expect(statusLabel(open, NOW)).toEqual({ tone: "open", text: "Open · closes in 2h 00m" });
    expect(statusLabel({ ...open, detail: "early_close" }, NOW).tone).toBe("early");
  });

  it("shows the next open in exchange time when it is more than a day away", () => {
    const closed = status({ detail: "holiday", opens_at: "2026-12-28T09:30:00-05:00" });
    expect(statusLabel(closed, NOW)).toEqual({
      tone: "closed",
      text: "Closed (holiday) · opens Mon 09:30",
    });
  });

  it("counts down to an open within a day", () => {
    const soon = status({ detail: "before_open", opens_at: "2026-12-24T12:30:00-05:00" });
    expect(statusLabel(soon, NOW).text).toBe("Closed · opens in 1h 30m");
  });

  it("says when hours are not on file", () => {
    expect(statusLabel(status({ state: "hours_unknown" }), NOW).tone).toBe("unknown");
    expect(statusLabel(status({ detail: "weekend" }), NOW).text).toBe("Closed (weekend)");
  });
});
