import { describe, expect, it } from "vitest";
import { feedUrls } from "./calendar-links";

describe("calendar feed links", () => {
  it("builds webcal, Google and download links", () => {
    const urls = feedUrls("XNYS", 2027);

    expect(urls.webcal).toBe("webcal://marketclock.ahmershah.dev/api/v1/markets/XNYS/calendar.ics");
    expect(urls.google).toBe(
      "https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Fmarketclock.ahmershah.dev%2Fapi%2Fv1%2Fmarkets%2FXNYS%2Fcalendar.ics",
    );
    expect(urls.download).toBe("/api/v1/markets/XNYS/calendar.ics?year=2027");
    expect(urls.csv).toBe("/api/v1/markets/XNYS/holidays.csv?year=2027");
  });
});
