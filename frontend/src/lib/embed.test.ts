import { describe, expect, it } from "vitest";
import type { Market, MarketStatus } from "@/lib/api/types";
import { embedHtml, embedSnippet, parseTheme } from "./embed";

const MARKET: Market = {
  code: "XNYS",
  name: "New <York> Stock Exchange",
  country: "United States",
  country_code: "US",
  timezone: "America/New_York",
  weekend: [5, 6],
  categories: ["half_day", "public"],
  first_year: 1863,
  last_year: 2100,
  source_url: "https://www.nyse.com",
  session: null,
};

const OPEN: MarketStatus = {
  market: "XNYS",
  state: "open",
  detail: "regular",
  local_time: "2026-07-02T10:00:00-04:00",
  closes_at: "2026-07-02T16:00:00-04:00",
  opens_at: null,
};

describe("embed widget", () => {
  it("defaults to the light theme", () => {
    expect(parseTheme(null)).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("neon")).toBe("light");
  });

  it("renders the status, links back and escapes text", () => {
    const html = embedHtml(MARKET, OPEN, Date.parse("2026-07-02T14:00:00Z"), "dark");

    expect(html).toContain("Open · closes in 6h 00m");
    expect(html).toContain('href="https://marketclock.ahmershah.dev/markets/XNYS"');
    expect(html).toContain("New &lt;York&gt; Stock Exchange");
    expect(html).not.toContain("<York>");
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain("#0e1013");
  });

  it("gives a copy-paste iframe", () => {
    expect(embedSnippet("XKAR")).toBe(
      '<iframe src="https://marketclock.ahmershah.dev/embed/XKAR" width="320" height="120" style="border:0" title="XKAR market status" loading="lazy"></iframe>',
    );
  });
});
