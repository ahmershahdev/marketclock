import { describe, expect, it } from "vitest";
import type { Market } from "@/lib/api/types";
import { llmsFull, llmsIndex } from "./llms";

const XSAU: Market = {
  code: "XSAU",
  name: "Saudi Exchange (Tadawul)",
  country: "Saudi Arabia",
  country_code: "SA",
  timezone: "Asia/Riyadh",
  weekend: [4, 5],
  categories: ["public"],
  first_year: 2020,
  last_year: 2100,
  source_url: "https://www.saudiexchange.sa",
  session: null,
};

describe("llms.txt", () => {
  it("starts with the title and a summary quote", () => {
    const lines = llmsIndex([XSAU]).split("\n");
    expect(lines[0]).toBe("# MarketClock");
    expect(lines[2]).toMatch(/^> /);
  });

  it("lists each market with a link and its weekend", () => {
    expect(llmsIndex([XSAU])).toContain(
      "- [XSAU](https://marketclock.ahmershah.dev/markets/XSAU): Saudi Exchange (Tadawul), Saudi Arabia. Timezone Asia/Riyadh, weekend Fri + Sat",
    );
  });

  it("links to the market list when the API is down", () => {
    expect(llmsIndex(null)).toContain("- [All markets](https://marketclock.ahmershah.dev/markets)");
    expect(llmsFull(null)).toContain("/api/v1/markets");
  });

  it("documents every error code", () => {
    const full = llmsFull([XSAU]);
    for (const code of [
      "invalid_parameter",
      "unknown_market",
      "year_out_of_range",
      "invalid_range",
      "invalid_markets",
      "no_default_cycle",
    ]) {
      expect(full).toContain(`\`${code}\``);
    }
  });
});
