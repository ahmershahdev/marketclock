import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApiError, ApiOffline } from "@/components/api-offline";
import { Flag } from "@/components/flag";
import { ArrowIcon } from "@/components/icons";
import { PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api/client";
import { parseYear } from "../../markets/[code]/market-calendar";

export async function generateMetadata({
  params,
}: PageProps<"/holidays/[year]">): Promise<Metadata> {
  const year = parseYear((await params).year);
  if (!year) return { title: "Page not found", robots: { index: false } };
  return {
    title: `Stock market holidays ${year}`,
    description: `Closures and early closes in ${year} for every exchange MarketClock covers, from NYSE and LSE to PSX and Tadawul.`,
    alternates: { canonical: `/holidays/${year}` },
  };
}

async function YearTable({ year }: { year: number }) {
  const markets = await api.markets();
  if (!markets.ok) {
    return markets.kind === "offline" ? (
      <ApiOffline what={`The ${year} holiday list`} />
    ) : (
      <ApiError message={markets.message} />
    );
  }
  const covered = markets.data.filter((m) => m.first_year <= year && year <= m.last_year);
  const results = await Promise.all(covered.map((m) => api.holidays(m.code, year)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="border-b border-rule-strong">
            {["Market", "Country", "Closures", "Early closes"].map((heading) => (
              <th key={heading} scope="col" className="py-3 pr-4 eyebrow font-normal">
                {heading}
              </th>
            ))}
            <th scope="col">
              <span className="sr-only">Open calendar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {covered.map((market, index) => {
            const result = results[index];
            const days = result.ok ? result.data.holidays : [];
            const early = days.filter((day) => day.half_day).length;
            return (
              <tr
                key={market.code}
                className="group relative border-b border-rule transition-colors hover:bg-surface"
              >
                <td className="py-4 pr-4">
                  <Link
                    href={`/markets/${market.code}/${year}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    <span className="mr-3 font-mono text-sm font-medium">{market.code}</span>
                    {market.name}
                  </Link>
                </td>
                <td className="py-4 pr-4 text-ink-2">
                  <span className="inline-flex items-center gap-2.5">
                    <Flag code={market.country_code} className="w-6" />
                    {market.country}
                  </span>
                </td>
                <td className="py-4 pr-4 font-mono text-sm tabular">
                  {result.ok ? days.length - early : "n/a"}
                </td>
                <td className="py-4 pr-4 font-mono text-sm tabular">{result.ok ? early : "n/a"}</td>
                <td className="py-4 pr-2 text-right text-ink-3 transition-[color,transform] group-hover:translate-x-1 group-hover:text-signal">
                  <ArrowIcon className="ml-auto" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

async function Content({ params }: PageProps<"/holidays/[year]">) {
  const year = parseYear((await params).year);
  if (!year) notFound();
  return (
    <>
      <PageHeader
        eyebrow={`Holidays / ${year}`}
        title={
          <>
            Market holidays <em className="text-signal">{year}.</em>
          </>
        }
        lead="Closures and early closes for every exchange in the holidays library. Open a market for its full calendar, or subscribe to it."
      >
        <div className="mt-8 flex gap-2">
          {year > 1950 && (
            <Link
              href={`/holidays/${year - 1}`}
              className="rounded-full border border-rule-strong px-4 py-2 font-mono text-sm hover:border-ink"
            >
              {year - 1}
            </Link>
          )}
          {year < 2100 && (
            <Link
              href={`/holidays/${year + 1}`}
              className="rounded-full border border-rule-strong px-4 py-2 font-mono text-sm hover:border-ink"
            >
              {year + 1}
            </Link>
          )}
        </div>
      </PageHeader>
      <section className="container-page">
        <Suspense
          fallback={
            <div className="flex flex-col gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          }
        >
          <YearTable year={year} />
        </Suspense>
      </section>
    </>
  );
}

export default function HolidaysYearPage(props: PageProps<"/holidays/[year]">) {
  return (
    <Suspense
      fallback={
        <div className="container-page pt-24">
          <Skeleton className="h-40 max-w-xl" />
        </div>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
