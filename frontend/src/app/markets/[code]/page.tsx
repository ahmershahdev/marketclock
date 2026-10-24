import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApiError, ApiOffline } from "@/components/api-offline";
import { ArrowIcon } from "@/components/icons";
import { CalendarLegend, MonthGrid, type Closure } from "@/components/month-grid";
import { Skeleton } from "@/components/ui";
import { WatchButton } from "@/components/watch-button";
import { api } from "@/lib/api/client";
import { WEEKDAY_SHORT, todayIn, weekdayOf, weekendLabel } from "@/lib/calendar";

const CODE_PATTERN = /^[A-Z0-9]{2,10}$/;

function parseYear(value: string | string[] | undefined, fallback: number): number {
  const year = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(year) && year >= 1950 && year <= 2100 ? year : fallback;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/markets/[code]">): Promise<Metadata> {
  const { code } = await params;
  const { year } = await searchParams;
  const suffix = typeof year === "string" && /^\d{4}$/.test(year) ? ` ${year}` : "";
  return {
    title: `${code.toUpperCase()} holidays${suffix}`,
    description: `Trading days, closures and early closes for ${code.toUpperCase()}${suffix}.`,
  };
}

async function MarketCalendar({ params, searchParams }: PageProps<"/markets/[code]">) {
  const code = (await params).code.toUpperCase();
  if (!CODE_PATTERN.test(code)) notFound();

  // Cache Components rejects the clock until a request API (searchParams) has been awaited.
  const yearParam = (await searchParams).year;
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const year = parseYear(yearParam, new Date(now).getUTCFullYear());

  const [markets, holidays] = await Promise.all([api.markets(), api.holidays(code, year)]);

  if (!markets.ok) {
    return (
      <Shell code={code}>
        {markets.kind === "offline" ? (
          <ApiOffline what="This market's calendar" />
        ) : (
          <ApiError message={markets.message} />
        )}
      </Shell>
    );
  }

  const market = markets.data.find((item) => item.code === code);
  if (!market) notFound();

  if (!holidays.ok) {
    return (
      <Shell code={code} name={market.name}>
        {holidays.kind === "offline" ? (
          <ApiOffline what="This market's calendar" />
        ) : (
          <ApiError message={holidays.message} />
        )}
      </Shell>
    );
  }

  const closures = new Map<string, Closure>(
    holidays.data.holidays.map((holiday) => [
      holiday.date,
      { name: holiday.name, halfDay: holiday.half_day },
    ]),
  );
  const today = todayIn(market.timezone, now);
  const fullCloses = holidays.data.holidays.filter((holiday) => !holiday.half_day).length;
  const earlyCloses = holidays.data.holidays.length - fullCloses;

  return (
    <Shell code={code} name={market.name}>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Country", market.country],
          ["Timezone", market.timezone],
          ["Weekend", weekendLabel(market.weekend)],
          ["Today there", today],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-5">
            <p className="mb-2 eyebrow">{label}</p>
            <p className="font-mono text-sm">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="flex items-end gap-6">
          <h2 className="text-display text-8xl tabular md:text-[10rem]">{year}</h2>
          <div className="flex gap-2 pb-4">
            <YearLink code={code} year={year - 1} label="Previous year" flip />
            <YearLink code={code} year={year + 1} label="Next year" />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <p className="text-ink-2 tabular">
            <span className="text-ink">{fullCloses}</span> closures,{" "}
            <span className="text-ink">{earlyCloses}</span> early closes
          </p>
          <CalendarLegend />
        </div>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            data-reveal=""
            style={{ ["--reveal-delay" as string]: `${(index % 4) * 60}ms` }}
          >
            <MonthGrid
              year={year}
              month={index + 1}
              weekend={market.weekend}
              closures={closures}
              today={today}
              compact
            />
          </div>
        ))}
      </div>

      <section className="mt-24" aria-labelledby="closures-heading">
        <h2 id="closures-heading" className="mb-8 text-display text-5xl">
          Closures in {year}
        </h2>
        {holidays.data.holidays.length === 0 ? (
          <p className="text-ink-3">The library lists no closures for this year.</p>
        ) : (
          <ol className="border-t border-rule">
            {holidays.data.holidays.map((holiday) => (
              <li
                key={holiday.date}
                className={`grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-4 border-b border-rule py-4 md:grid-cols-[9rem_4rem_1fr_auto] ${
                  holiday.date < today ? "text-ink-3" : ""
                }`}
              >
                <time dateTime={holiday.date} className="font-mono text-sm tabular">
                  {holiday.date}
                </time>
                <span className="hidden eyebrow md:block">
                  {WEEKDAY_SHORT[weekdayOf(holiday.date)]}
                </span>
                <span className="text-lg">{holiday.name}</span>
                <span
                  className={`rounded-full border px-2.5 py-1 eyebrow ${
                    holiday.half_day ? "border-early/50 text-early" : "border-closed/50 text-closed"
                  }`}
                >
                  {holiday.half_day
                    ? `Early close${holiday.close_time ? ` ${holiday.close_time}` : ""}`
                    : "Closed"}
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-6 text-sm text-ink-3">
          Dates from the holidays library. Wrong date? Report it upstream with a link to the
          exchange&apos;s own calendar.
        </p>
      </section>
    </Shell>
  );
}

function Shell({
  code,
  name,
  children,
}: {
  code: string;
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex flex-col justify-between gap-8 pt-16 pb-12 md:flex-row md:items-end md:pt-24">
        <div>
          <Link
            href="/markets"
            className="mb-8 inline-flex items-center gap-2 eyebrow hover:text-ink"
          >
            <ArrowIcon className="rotate-180" width={12} height={12} />
            All markets
          </Link>
          <h1 className="rise font-mono text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-light tracking-[-0.07em]">
            {code}
          </h1>
          {name && (
            <p
              className="mt-4 rise text-display text-3xl text-ink-2 md:text-4xl"
              style={{ animationDelay: "100ms" }}
            >
              {name}
            </p>
          )}
        </div>
        <WatchButton code={code} />
      </header>
      {children}
    </>
  );
}

function YearLink({
  code,
  year,
  label,
  flip = false,
}: {
  code: string;
  year: number;
  label: string;
  flip?: boolean;
}) {
  return (
    <Link
      href={`/markets/${code}?year=${year}`}
      aria-label={`${label}: ${year}`}
      className="grid size-11 place-items-center rounded-full border border-rule-strong transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      <ArrowIcon className={flip ? "rotate-180" : ""} />
    </Link>
  );
}

function CalendarSkeleton() {
  return (
    <div className="pt-24">
      <Skeleton className="h-40 max-w-md" />
      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

export default function MarketPage(props: PageProps<"/markets/[code]">) {
  return (
    <div className="container-page">
      <Suspense fallback={<CalendarSkeleton />}>
        <MarketCalendar {...props} />
      </Suspense>
    </div>
  );
}
