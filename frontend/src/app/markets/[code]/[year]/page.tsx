import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, marketYearTitle, pageMetadata } from "@/lib/seo";
import { CalendarSkeleton, MarketCalendar, marketCode, parseYear } from "../market-calendar";

export async function generateMetadata({
  params,
}: PageProps<"/markets/[code]/[year]">): Promise<Metadata> {
  const { code: rawCode, year: rawYear } = await params;
  const upper = marketCode(rawCode);
  const year = parseYear(rawYear);
  if (!upper || !year) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: marketYearTitle(upper, year),
    description: `Every ${upper} closure, early close and trading day in ${year}, from the holidays library and checked against the exchange.`,
    path: `/markets/${upper}/${year}`,
  });
}

async function Year({ params }: PageProps<"/markets/[code]/[year]">) {
  const { code: rawCode, year: rawYear } = await params;
  const code = marketCode(rawCode);
  const year = parseYear(rawYear);
  if (!code || !year) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          ["Markets", "/markets"],
          [code, `/markets/${code}`],
          [String(year), `/markets/${code}/${year}`],
        ])}
      />
      <MarketCalendar code={code} year={year} />
    </>
  );
}

export default function MarketYearPage(props: PageProps<"/markets/[code]/[year]">) {
  return (
    <div className="container-page">
      <Suspense fallback={<CalendarSkeleton />}>
        <Year {...props} />
      </Suspense>
    </div>
  );
}
