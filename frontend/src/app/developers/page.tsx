import type { Metadata } from "next";
import { PageHeader, Panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "API",
  description: "The MarketClock REST API: trading days, closures, settlement dates and overlap.",
};

const ENDPOINTS = [
  {
    path: "/markets",
    params: "",
    summary: "Every supported market: code, name, country, timezone, weekend and categories.",
  },
  {
    path: "/markets/{code}",
    params: "",
    summary: "One market, with the years the library has data for and the source of its details.",
  },
  {
    path: "/markets/{code}/holidays",
    params: "year",
    summary: "Closures and half days for one year, with names.",
  },
  {
    path: "/markets/{code}/status",
    params: "at (optional)",
    summary:
      "Open or closed now, or at a given time, with the next close or open in exchange time.",
  },
  {
    path: "/status",
    params: "at (optional)",
    summary: "Open or closed now for every market.",
  },
  {
    path: "/markets/{code}/calendar.ics",
    params: "year (optional)",
    summary: "iCalendar feed of closures and early closes: this year and next, or one year.",
  },
  {
    path: "/markets/{code}/is-trading-day",
    params: "date",
    summary: "Whether the market trades on a date.",
  },
  {
    path: "/markets/{code}/next-trading-day",
    params: "date",
    summary: "The first trading day after a date.",
  },
  {
    path: "/markets/{code}/previous-trading-day",
    params: "date",
    summary: "The last trading day before a date.",
  },
  {
    path: "/markets/{code}/trading-days",
    params: "start, end",
    summary: "Trading days in a range, both ends included, at most 400 days.",
  },
  {
    path: "/markets/{code}/settlement-cycle",
    params: "date",
    summary: "The settlement cycle in force on a date, with its regulator source, or null.",
  },
  {
    path: "/settlement",
    params: "markets, trade_date, cycle",
    summary:
      "T+n settlement date: the n-th day after the trade on which every market is open. Without cycle, the cycle in force is used.",
  },
  {
    path: "/overlap",
    params: "markets, start, end",
    summary: "Days on which every listed market trades.",
  },
];

const RULES = [
  ["Versioned", "Everything lives under /api/v1 and returns JSON."],
  ["Plain dates", "Dates are ISO YYYY-MM-DD. Timezones only matter for “open right now”."],
  ["Capped ranges", "Ranges include both ends: at most 400 days, or 10 years."],
  ["Validated", "Market codes, dates and categories are checked against the library."],
];

export default function DevelopersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Developers / REST API"
        title={
          <>
            Small API, <em className="text-ink-3">exact answers.</em>
          </>
        }
        lead="Read-only endpoints for trading days, closures, settlement and overlap. No keys while it is in preview."
      >
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-early/50 px-3 py-1 font-mono text-xs text-early">
          <span className="size-1.5 rounded-full bg-early" />
          In development: shapes may change before v1 ships
        </p>
      </PageHeader>

      <section className="container-page">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-4">
          {RULES.map(([title, body]) => (
            <div key={title} className="bg-surface p-6">
              <p className="mb-3 eyebrow">{title}</p>
              <p className="text-sm text-ink-2">{body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-24 mb-8 text-display text-5xl md:text-6xl">Endpoints</h2>
        <ul className="border-t border-rule">
          {ENDPOINTS.map((endpoint) => (
            <li
              key={endpoint.path}
              data-reveal=""
              className="grid gap-3 border-b border-rule py-6 md:grid-cols-12 md:items-baseline"
            >
              <code className="font-mono text-sm md:col-span-6">
                <span className="mr-3 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-paper">
                  GET
                </span>
                <span className="text-ink-3">/api/v1</span>
                {endpoint.path}
              </code>
              <span className="font-mono text-xs text-ink-3 md:col-span-2">
                {endpoint.params && `?${endpoint.params}`}
              </span>
              <p className="text-ink-2 md:col-span-4">{endpoint.summary}</p>
            </li>
          ))}
        </ul>

        <div className="mt-24 grid gap-6 md:grid-cols-2 [&>*]:min-w-0">
          <Panel>
            <p className="mb-4 eyebrow">Errors</p>
            <h3 className="mb-4 text-display text-3xl">One shape for every failure.</h3>
            <pre className="overflow-x-auto rounded-xl border border-rule bg-paper p-4 font-mono text-xs leading-6 text-ink-2">
              {`{
  "error": {
    "code": "unknown_market",
    "message": "Unknown market 'XXXX'",
    "params": { "market": "XXXX" }
  }
}`}
            </pre>
          </Panel>
          <Panel>
            <p className="mb-4 eyebrow">Data</p>
            <h3 className="mb-4 text-display text-3xl">Where the answers come from.</h3>
            <ul className="space-y-3 text-sm text-ink-2">
              <li>Closures and half days: the holidays library, never copied into MarketClock.</li>
              <li>Weekends: the library&apos;s own market class.</li>
              <li>
                Name, country and timezone: each exchange&apos;s website, with the source URL in
                every response. Session hours and settlement cycles will follow the same rule.
              </li>
            </ul>
          </Panel>
        </div>
      </section>
    </>
  );
}
