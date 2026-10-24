import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApiError, ApiOffline } from "@/components/api-offline";
import { CalendarLinks } from "@/components/calendar-links";
import { Flag } from "@/components/flag";
import { MarketStatusBadge } from "@/components/market-status-badge";
import { ArrowIcon } from "@/components/icons";
import { CalendarLegend, MonthGrid, type Closure } from "@/components/month-grid";
import { Skeleton } from "@/components/ui";
import { WatchButton } from "@/components/watch-button";
import { api } from "@/lib/api/client";
import { WEEKDAY_SHORT, todayIn, weekdayOf, weekendLabel } from "@/lib/calendar";

const CODE_PATTERN = /^[A-Z0-9]{2,10}$/;

export const FIRST_YEAR = 1950;
export const LAST_YEAR = 2100;

export function parseYear(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d{4}$/.test(raw)) return null;
  const year = Number(raw);
  return year >= FIRST_YEAR && year <= LAST_YEAR ? year : null;
}

export function marketCode(value: string): string | null {
  const code = value.toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

export async function MarketCalendar({
  code,
  year: chosen,
}: {
  code: string;
  year: number | null;
}) {
  // Cache Components rejects the clock during prerender unless the render is deferred to request time.
  await connection();
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const year = chosen ?? new Date(now).getUTCFullYear();

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
      <Shell code={code} name={market.name} countryCode={market.country_code}>
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
    <Shell code={code} name={market.name} countryCode={market.country_code}>
      <div
        className={`grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 ${
          market.session ? "lg:grid-cols-5" : "lg:grid-cols-4"
        }`}
      >
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
        {market.session && (
          <div className="bg-surface p-5">
            <p className="mb-2 eyebrow">Hours</p>
            <p className="font-mono text-sm">
              {market.session.open && market.session.close
                ? `${market.session.open} to ${market.session.close}`
                : "Not on file"}
            </p>
            <p className="mt-1 text-xs text-ink-3">
              {market.session.early_close && `Early close ${market.session.early_close}. `}
              <a
                href={market.session.source_url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-rule-strong underline-offset-4 hover:text-ink"
              >
                Source
              </a>
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="flex items-end gap-6">
          <h2 className="text-display text-8xl tabular md:text-[10rem]">{year}</h2>
          <div className="flex gap-2 pb-4">
            {year > FIRST_YEAR && (
              <YearLink code={code} year={year - 1} label="Previous year" flip />
            )}
            {year < LAST_YEAR && <YearLink code={code} year={year + 1} label="Next year" />}
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
          <div key={index} data-reveal="">
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
        <CalendarLinks code={code} year={year} />
      </section>
    </Shell>
  );
}

function Shell({
  code,
  name,
  countryCode,
  children,
}: {
  code: string;
  name?: string;
  countryCode?: string;
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
              className="mt-4 flex rise items-center gap-4 text-display text-3xl text-ink-2 md:text-4xl"
              style={{ animationDelay: "100ms" }}
            >
              {countryCode && <Flag code={countryCode} className="w-10 md:w-12" />}
              {name}
            </p>
          )}
          {name && (
            <div className="mt-5">
              <MarketStatusBadge code={code} />
            </div>
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
      href={`/markets/${code}/${year}`}
      aria-label={`${label}: ${year}`}
      className="grid size-11 place-items-center rounded-full border border-rule-strong transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      <ArrowIcon className={flip ? "rotate-180" : ""} />
    </Link>
  );
}

export function CalendarSkeleton() {
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
