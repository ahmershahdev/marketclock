"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, StarIcon } from "@/components/icons";
import { ButtonLink, Panel, Skeleton } from "@/components/ui";
import { api } from "@/lib/api/client";
import type { MarketHoliday } from "@/lib/api/types";
import { WEEKDAY_SHORT, todayIn, weekdayOf } from "@/lib/calendar";
import { useNow } from "@/lib/use-now";
import { useWatchlist } from "@/lib/watchlist";

type Upcoming =
  { state: "loading" } | { state: "offline" } | { state: "ready"; days: MarketHoliday[] };

const UPCOMING_LIMIT = 4;

function daysUntil(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function useUpcoming(code: string, today: string | null): Upcoming {
  const [upcoming, setUpcoming] = useState<Upcoming>({ state: "loading" });

  useEffect(() => {
    if (!today) return;
    let cancelled = false;
    const year = Number(today.slice(0, 4));
    Promise.all([api.holidays(code, year), api.holidays(code, year + 1)]).then((results) => {
      if (cancelled) return;
      if (results.some((result) => !result.ok)) {
        setUpcoming({ state: "offline" });
        return;
      }
      const days = results
        .flatMap((result) => (result.ok ? result.data.holidays : []))
        .filter((holiday) => holiday.date >= today)
        .slice(0, UPCOMING_LIMIT);
      setUpcoming({ state: "ready", days });
    });
    return () => {
      cancelled = true;
    };
  }, [code, today]);

  return upcoming;
}

function WatchCard({
  code,
  today,
  onRemove,
}: {
  code: string;
  today: string | null;
  onRemove: () => void;
}) {
  const upcoming = useUpcoming(code, today);

  return (
    <Panel className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <Link
          href={`/markets/${code}`}
          className="font-mono text-5xl font-light tracking-[-0.06em] transition-colors hover:text-signal"
        >
          {code}
        </Link>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${code} from watchlist`}
          className="grid size-9 place-items-center rounded-full border border-rule text-ink-3 transition-colors hover:border-ink hover:text-ink"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
      <div>
        <p className="mb-3 eyebrow">Next closures</p>
        {upcoming.state === "loading" && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        )}
        {upcoming.state === "offline" && (
          <p className="text-sm text-ink-3">API not reachable. Start it to see dates.</p>
        )}
        {upcoming.state === "ready" &&
          (upcoming.days.length === 0 ? (
            <p className="text-sm text-ink-3">No closures listed ahead.</p>
          ) : (
            <ol className="border-t border-rule">
              {upcoming.days.map((holiday) => (
                <li
                  key={holiday.date}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 border-b border-rule py-3"
                >
                  <time dateTime={holiday.date} className="font-mono text-xs text-ink-2 tabular">
                    {WEEKDAY_SHORT[weekdayOf(holiday.date)]} {holiday.date}
                  </time>
                  <span className="truncate text-sm">{holiday.name}</span>
                  <span
                    className={`font-mono text-xs tabular ${holiday.half_day ? "text-early" : "text-closed"}`}
                  >
                    {today && daysUntil(today, holiday.date) === 0
                      ? "today"
                      : today && `in ${daysUntil(today, holiday.date)}d`}
                  </span>
                </li>
              ))}
            </ol>
          ))}
      </div>
    </Panel>
  );
}

export function WatchlistView() {
  const { codes, remove } = useWatchlist();
  const now = useNow();
  const today =
    now === null ? null : todayIn(Intl.DateTimeFormat().resolvedOptions().timeZone, now);

  if (codes.length === 0) {
    return (
      <Panel className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <span className="grid size-14 place-items-center rounded-full bg-sunken text-ink-3">
            <StarIcon width={22} height={22} />
          </span>
          <div>
            <p className="text-display text-3xl">Nothing on your watchlist yet.</p>
            <p className="mt-1 text-ink-2">Open a market and add it to follow its next closures.</p>
          </div>
        </div>
        <ButtonLink href="/markets">Browse markets</ButtonLink>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {codes.map((code) => (
        <WatchCard key={code} code={code} today={today} onRemove={() => remove(code)} />
      ))}
    </div>
  );
}
