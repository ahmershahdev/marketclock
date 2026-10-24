import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { api } from "@/lib/api/client";
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

  const markets = await api.markets();
  if (!markets.ok) return pages;

  return pages.concat(
    markets.data.flatMap((market) => [
      {
        url: absoluteUrl(`/markets/${market.code}`),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      ...[year, year + 1].map((y) => ({
        url: absoluteUrl(`/markets/${market.code}?year=${y}`),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]),
  );
}
