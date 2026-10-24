import { describe, expect, it } from "vitest";
import {
  dayKind,
  daysInMonth,
  isValidIsoDate,
  isoDate,
  monthWeeks,
  todayIn,
  weekdayOf,
  weekendLabel,
} from "./calendar";

describe("isoDate", () => {
  it("pads every part", () => {
    expect(isoDate(2027, 1, 5)).toBe("2027-01-05");
  });
});

describe("isValidIsoDate", () => {
  it("accepts real dates", () => {
    expect(isValidIsoDate("2028-02-29")).toBe(true);
  });

  it("rejects impossible dates and bad formats", () => {
    expect(isValidIsoDate("2027-02-29")).toBe(false);
    expect(isValidIsoDate("2027-13-01")).toBe(false);
    expect(isValidIsoDate("2027-1-01")).toBe(false);
  });
});

describe("weekdayOf", () => {
  it("numbers Monday as 0 like Python", () => {
    expect(weekdayOf("2026-10-26")).toBe(0);
    expect(weekdayOf("2026-10-25")).toBe(6);
  });
});

describe("daysInMonth", () => {
  it("handles leap years", () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
  });
});

describe("monthWeeks", () => {
  it("starts on Monday and pads to full weeks", () => {
    const weeks = monthWeeks(2026, 10);
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, "2026-10-01"]);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
  });
});

describe("dayKind", () => {
  const closures = new Map([
    ["2026-12-25", { halfDay: false }],
    ["2026-12-24", { halfDay: true }],
  ]);

  it("puts closures before the weekend", () => {
    expect(dayKind("2026-12-25", [5, 6], closures)).toBe("closed");
    expect(dayKind("2026-12-24", [5, 6], closures)).toBe("early");
  });

  it("uses the market's own weekend", () => {
    expect(dayKind("2026-10-23", [4, 5], closures)).toBe("weekend");
    expect(dayKind("2026-10-23", [5, 6], closures)).toBe("open");
  });
});

describe("weekendLabel", () => {
  it("names the days", () => {
    expect(weekendLabel([4, 5])).toBe("Fri + Sat");
  });
});

describe("todayIn", () => {
  it("uses the market's timezone, not the machine's", () => {
    const instant = Date.UTC(2026, 9, 24, 22, 30);
    expect(todayIn("UTC", instant)).toBe("2026-10-24");
    expect(todayIn("Asia/Karachi", instant)).toBe("2026-10-25");
  });
});
