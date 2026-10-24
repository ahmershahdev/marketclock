import { describe, expect, it } from "vitest";
import { parseThemeChoice, resolveTheme } from "./theme";

describe("parseThemeChoice", () => {
  it("falls back to system for unknown values", () => {
    expect(parseThemeChoice(null)).toBe("system");
    expect(parseThemeChoice("sepia")).toBe("system");
    expect(parseThemeChoice("dark")).toBe("dark");
  });
});

describe("resolveTheme", () => {
  it("follows the system only when asked to", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });
});
