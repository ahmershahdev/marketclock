import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ApiError, ApiOffline } from "@/components/api-offline";
import { Flag } from "@/components/flag";
import { PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api/client";
import type { Market, MarketQuality } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Data quality",
  description:
    "Holiday dates from the holidays library checked against each exchange's published calendar, with every difference and its source.",
};

const DIFFERENCE_LABEL = {
  missing_in_library: "Missing in the library",
  extra_in_library: "Extra in the library",
  category_differs: "Closed or half day differs",
} as const;

function QualityCard({ report, market }: { report: MarketQuality; market?: Market }) {
  const clean = report.differences.length === 0;
  return (
    <li className="rounded-2xl border border-rule bg-surface p-6 md:p-8" data-reveal="">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/markets/${report.market}`}
            className="flex items-center gap-3 font-mono text-2xl hover:text-signal"
          >
            {market && <Flag code={market.country_code} className="w-8" />}
            {report.market}
          </Link>
          {market && <p className="mt-1 text-ink-2">{market.name}</p>}
        </div>
        <span
          className={`rounded-full border px-3 py-1 eyebrow ${
            clean ? "border-open/50 text-open" : "border-closed/50 text-closed"
          }`}
        >
          {clean ? "Matches the exchange" : `${report.differences.length} differences`}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="eyebrow">Years checked</dt>
          <dd className="mt-1 font-mono">{report.years.join(", ")}</dd>
        </div>
        <div>
          <dt className="eyebrow">Official days</dt>
          <dd className="mt-1 font-mono tabular">{report.official_days}</dd>
        </div>
        <div>
          <dt className="eyebrow">Checked on</dt>
          <dd className="mt-1 font-mono">{report.checked_on}</dd>
        </div>
      </dl>

      {!clean && (
        <ol className="mt-6 border-t border-rule">
          {report.differences.map((difference) => (
            <li
              key={difference.date}
              className="grid gap-2 border-b border-rule py-3 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline"
            >
              <time dateTime={difference.date} className="font-mono text-sm">
                {difference.date}
              </time>
              <span>{difference.official_name ?? "Not on the exchange calendar"}</span>
              <span className="eyebrow text-closed">{DIFFERENCE_LABEL[difference.kind]}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 text-sm text-ink-3">
        Source:{" "}
        {report.sources.map((source) => (
          <a
            key={source}
            href={source}
            target="_blank"
            rel="noreferrer"
            className="break-all underline decoration-rule-strong underline-offset-4 hover:text-ink"
          >
            {source}
          </a>
        ))}
      </p>
    </li>
  );
}

async function Report() {
  const [report, markets] = await Promise.all([api.dataQuality(), api.markets()]);
  if (!report.ok) {
    return report.kind === "offline" ? (
      <ApiOffline what="The data-quality report" />
    ) : (
      <ApiError message={report.message} />
    );
  }
  const byCode = new Map((markets.ok ? markets.data : []).map((market) => [market.code, market]));
  return (
    <ul className="grid gap-6 lg:grid-cols-2">
      {report.data.markets.map((item) => (
        <QualityCard key={item.market} report={item} market={byCode.get(item.market)} />
      ))}
    </ul>
  );
}

export default function DataQualityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Data quality"
        title={
          <>
            Checked against <em className="text-signal">the exchange.</em>
          </>
        }
        lead="Each market's closures and half days from the holidays library, compared day by day with the calendar the exchange publishes. Real differences go back to the library as fixes."
      />
      <section className="container-page">
        <Suspense
          fallback={
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          }
        >
          <Report />
        </Suspense>
        <p className="mt-10 max-w-2xl text-sm text-ink-3">
          Only whole years are compared, so a partly published year never shows false differences.
          More markets are added as their official calendars are confirmed.
        </p>
      </section>
    </>
  );
}
