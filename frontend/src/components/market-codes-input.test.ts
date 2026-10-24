import { describe, expect, it } from "vitest";
import type { Market } from "@/lib/api/types";
import { completeCode, lastToken, matchMarkets, parseCodes } from "./market-codes-input";

function market(code: string, name: string, country: string): Market {
  return {
    code,
    name,
    country,
    country_code: "XX",
    timezone: "UTC",
    weekend: [5, 6],
    categories: ["public"],
    first_year: 2000,
    last_year: 2100,
    source_url: "https://example.com",
    session: null,
  };
}

const MARKETS = [
  market("XKAR", "Pakistan Stock Exchange", "Pakistan"),
  market("XLON", "London Stock Exchange", "United Kingdom"),
  market("XNYS", "New York Stock Exchange", "United States"),
];

describe("market codes input", () => {
  it("parses unique upper-case codes", () => {
    expect(parseCodes("xnys, xlon xnys")).toEqual(["XNYS", "XLON"]);
  });

  it("reads the code being typed", () => {
    expect(lastToken("XNYS, xl")).toBe("xl");
    expect(lastToken("XNYS, ")).toBe("");
  });

  it("replaces the code being typed with the chosen one", () => {
    expect(completeCode("XNYS, lon", "XLON")).toBe("XNYS, XLON, ");
    expect(completeCode("", "XKAR")).toBe("XKAR, ");
  });

  it("matches code, name and country", () => {
    expect(matchMarkets(MARKETS, "pak").map((m) => m.code)).toEqual(["XKAR"]);
    expect(matchMarkets(MARKETS, "united").map((m) => m.code)).toEqual(["XLON", "XNYS"]);
  });

  it("hides markets already chosen", () => {
    expect(matchMarkets(MARKETS, "XNYS, ").map((m) => m.code)).toEqual(["XKAR", "XLON"]);
  });
});
