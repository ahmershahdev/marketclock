"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { Flag } from "@/components/flag";
import { ArrowIcon } from "@/components/icons";
import { inputClass } from "@/components/ui";
import { api } from "@/lib/api/client";
import type { Market, MarketStatus } from "@/lib/api/types";
import { TONE_DOT, statusLabel } from "@/lib/market-status";
import { weekendLabel } from "@/lib/calendar";

export function MarketTable({ markets }: { markets: Market[] }) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Map<string, MarketStatus>>(new Map());
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.allStatus().then((result) => {
      if (!cancelled && result.ok) {
        setStatuses(new Map(result.data.map((item) => [item.market, item])));
        setNow(Date.now());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const visible = deferred
    ? markets.filter((market) =>
        [market.code, market.name, market.country].some((value) =>
          value.toLowerCase().includes(deferred),
        ),
      )
    : markets;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by code, name or country"
          aria-label="Search markets"
          className={`${inputClass} md:max-w-sm`}
        />
        <p className="eyebrow tabular">
          {visible.length} of {markets.length} markets
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-rule-strong">
              {["Code", "Market", "Now", "Country", "Timezone", "Weekend"].map((heading) => (
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
            {visible.map((market) => (
              <tr
                key={market.code}
                className="group relative border-b border-rule transition-colors hover:bg-surface"
              >
                <td className="py-5 pr-4 pl-1 font-mono text-sm font-medium">
                  <Link
                    href={`/markets/${market.code}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {market.code}
                  </Link>
                </td>
                <td className="py-5 pr-4 text-lg">{market.name}</td>
                <td className="py-5 pr-4 text-sm text-ink-2">
                  <StatusCell status={statuses.get(market.code)} now={now} />
                </td>
                <td className="py-5 pr-4 text-ink-2">
                  <span className="inline-flex items-center gap-2.5">
                    <Flag code={market.country_code} className="w-6" />
                    {market.country}
                  </span>
                </td>
                <td className="py-5 pr-4 font-mono text-xs text-ink-2">{market.timezone}</td>
                <td className="py-5 pr-4 font-mono text-xs text-ink-2">
                  {weekendLabel(market.weekend)}
                </td>
                <td className="py-5 pr-2 text-right text-ink-3 transition-[color,transform] group-hover:translate-x-1 group-hover:text-signal">
                  <ArrowIcon className="ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="py-16 text-center text-ink-3">No market matches &ldquo;{query}&rdquo;.</p>
        )}
      </div>
    </div>
  );
}

function StatusCell({ status, now }: { status?: MarketStatus; now: number }) {
  if (!status) return <span className="text-ink-3">-</span>;
  const label = statusLabel(status, now);
  const short = label.text.split(" · ")[0];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap" title={label.text}>
      <span className={`size-1.5 rounded-full ${TONE_DOT[label.tone]}`} />
      {short.replace("Trading day", "Hours n/a")}
    </span>
  );
}
