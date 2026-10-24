import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  breadcrumbs,
  fullTitle,
  holidaysYearTitle,
  marketTitle,
  marketYearTitle,
  pageMetadata,
} from "./seo";

describe("seo", () => {
  it("keeps every generated title under the limit, with the longest codes", () => {
    for (const code of ["XNYS", "BVMF", "IFEU"]) {
      expect(fullTitle(marketTitle(code)).length).toBeLessThanOrEqual(TITLE_MAX);
      expect(fullTitle(marketYearTitle(code, 2027)).length).toBeLessThanOrEqual(TITLE_MAX);
    }
    expect(fullTitle(holidaysYearTitle(2027)).length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it("adds the site name once", () => {
    expect(fullTitle("Markets")).toBe("Markets | MarketClock");
    expect(fullTitle("MarketClock API")).toBe("MarketClock API");
  });

  it("builds canonical, Open Graph and Twitter tags", () => {
    const meta = pageMetadata({ title: "Markets", description: "d", path: "/markets" });

    expect(meta.alternates?.canonical).toBe("/markets");
    expect(meta.openGraph).toMatchObject({ title: "Markets | MarketClock", url: "/markets" });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
    expect(meta.robots).toBeUndefined();
    expect(pageMetadata({ title: "x", description: "d", path: "/x", index: false }).robots).toEqual(
      {
        index: false,
        follow: true,
      },
    );
  });

  it("starts breadcrumbs at home with absolute URLs", () => {
    const list = breadcrumbs([
      ["Markets", "/markets"],
      ["XNYS", "/markets/XNYS"],
    ]);

    expect(list.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(list.itemListElement[2]).toMatchObject({
      name: "XNYS",
      item: "https://marketclock.ahmershah.dev/markets/XNYS",
    });
  });

  it("documents the description limit", () => {
    expect(DESCRIPTION_MAX).toBe(140);
  });
});
