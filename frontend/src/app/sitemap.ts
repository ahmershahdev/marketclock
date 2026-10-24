import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getMarkets } from "@/lib/api/server";
import { absoluteUrl, PAGES } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Built per request: at build time the API is usually not running, so markets would be missing.
  await connection();
  const year = new Date().getUTCFullYear();
  const pages: MetadataRoute.Sitemap = PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: "weekly",
    priority: page.path === "/" ? 1 : 0.7,
  }));

  const markets = await getMarkets();
  const years = [year, year + 1];
  const yearIndexes: MetadataRoute.Sitemap = years.map((y) => ({
    url: absoluteUrl(`/holidays/${y}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  if (!markets.ok) return pages.concat(yearIndexes);

  return pages.concat(
    yearIndexes,
    markets.data.flatMap((market) => [
      {
        url: absoluteUrl(`/markets/${market.code}`),
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
      ...years.map((y) => ({
        url: absoluteUrl(`/markets/${market.code}/${y}`),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]),
  );
}
