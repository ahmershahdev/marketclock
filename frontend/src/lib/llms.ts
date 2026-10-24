import type { Market } from "@/lib/api/types";
import { weekendLabel } from "@/lib/calendar";
import { CONTACT } from "@/lib/contact";
import { absoluteUrl, PAGES, SITE_NAME, SITE_SUMMARY } from "@/lib/site";

const API = absoluteUrl("/api/v1");

const ENDPOINTS = [
  ["GET /markets", "", "Every market: code, name, country, timezone, weekend, categories."],
  ["GET /markets/{code}", "", "One market, with the years the library has data for."],
  ["GET /markets/{code}/holidays", "year", "Closures and half days of one year, with names."],
  [
    "GET /markets/{code}/status",
    "at (optional, ISO time with offset)",
    "open, closed or hours_unknown now or at the given time, with closes_at or opens_at in exchange time; GET /status returns every market.",
  ],
  [
    "GET /markets/{code}/holidays.csv",
    "year",
    "Closures and half days of one year as CSV: date, name, category, half_day, close_time.",
  ],
  [
    "GET /markets/{code}/calendar.ics",
    "year (optional)",
    "iCalendar feed of closures and early closes for subscribing in Google Calendar, Apple Calendar or Outlook; without year it covers this year and next.",
  ],
  ["GET /markets/{code}/is-trading-day", "date", "Whether the market trades on a date."],
  ["GET /markets/{code}/next-trading-day", "date", "First trading day after a date."],
  ["GET /markets/{code}/previous-trading-day", "date", "Last trading day before a date."],
  [
    "GET /markets/{code}/trading-days",
    "start, end",
    "Trading days in a range, both ends included.",
  ],
  [
    "GET /markets/{code}/settlement-cycle",
    "date",
    "The settlement cycle in force on a date, with its effective date and regulator source, or null when none is on file.",
  ],
  [
    "GET /settlement",
    "markets, trade_date, cycle (optional)",
    "T+n settlement date: the n-th day after the trade date on which every listed market is open (cycle 0 to 10, up to 10 markets). Without cycle, the longest cycle in force on the trade date is used and its sources are returned.",
  ],
  [
    "GET /data-quality",
    "",
    "Library dates compared with each exchange's published calendar (whole years), with every difference and its source.",
  ],
  [
    "GET /add-trading-days",
    "markets, date, days",
    "The date moved by n trading days (negative goes back, at most 400) on every listed market.",
  ],
  ["GET /overlap", "markets, start, end", "Days in a range on which every listed market trades."],
] as const;

const ERRORS = [
  ["invalid_parameter", 400, "A query parameter is missing, unknown or malformed."],
  [
    "unknown_market",
    404,
    "The code is not a MIC the library supports. Aliases such as NYSE are rejected.",
  ],
  ["year_out_of_range", 400, "The library has no data for that market in that year."],
  ["invalid_range", 400, "start is after end, or the range is longer than 400 days."],
  [
    "rate_limited",
    429,
    "More than 120 requests a minute from one client; Retry-After says when to retry.",
  ],
  [
    "no_default_cycle",
    400,
    "cycle was left out and no settlement cycle is on file for a listed market.",
  ],
  ["invalid_markets", 400, "The markets list is empty, repeats a code, or has more than 10 codes."],
] as const;

function marketLines(markets: Market[]): string[] {
  return markets.map(
    (m) =>
      `- [${m.code}](${absoluteUrl(`/markets/${m.code}`)}): ${m.name}, ${m.country}. Timezone ${m.timezone}, weekend ${weekendLabel(m.weekend)}, data ${m.first_year} to ${m.last_year}.`,
  );
}

function urlPatterns(): string[] {
  return [
    `- ${absoluteUrl("/markets/XNYS")}: one market, live status, hours and the current year`,
    `- ${absoluteUrl("/markets/XNYS/2027")}: one market's closures and early closes in a given year`,
    `- ${absoluteUrl("/holidays/2027")}: every exchange's closures and early closes in a given year`,
    `- ${API}/markets/XNYS/calendar.ics: calendar subscription for this year and next`,
    `- ${absoluteUrl("/embed/XNYS")}: small status card for other sites (add ?theme=dark)`,
  ];
}

function header(): string[] {
  return [`# ${SITE_NAME}`, "", `> ${SITE_SUMMARY}`, ""];
}

export function llmsIndex(markets: Market[] | null): string {
  return [
    ...header(),
    "Holiday dates come from the holidays library and are never copied. Market codes are ISO 10383 MICs (XNYS, XLON, XKAR). Dates are YYYY-MM-DD.",
    "",
    "## Pages",
    "",
    ...PAGES.map((page) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`),
    "",
    "## URL patterns",
    "",
    ...urlPatterns(),
    "",
    "## API",
    "",
    `- [OpenAPI schema](${API}/openapi.json): machine-readable description of every endpoint`,
    `- [Full reference for language models](${absoluteUrl("/llms-full.txt")}): endpoints, errors, examples and every market`,
    "",
    "## Markets",
    "",
    ...(markets ? marketLines(markets) : [`- [All markets](${absoluteUrl("/markets")})`]),
    "",
    "## Optional",
    "",
    `- [Source code](${CONTACT.github})`,
    `- [Author](${CONTACT.website})`,
    "",
  ].join("\n");
}

export function llmsFull(markets: Market[] | null): string {
  return [
    ...header(),
    "## What it answers",
    "",
    "- Is an exchange open on a date, and what are the next and previous trading days?",
    "- Which days in a range are trading days, using each market's own weekend (Friday and Saturday for the Saudi Exchange, Saturday and Sunday for most others)?",
    "- Which days are closures and which are half days (early closes)?",
    "- When does a trade settle (T+n), counted in days on which every listed market is open?",
    "- On which days are several markets all open?",
    "- Is a market open right now, and when does it close or open next, in its own time zone?",
    "- Which settlement cycle (T+1, T+2) was in force on a given trade date, and where is that rule published?",
    "",
    "## Data",
    "",
    "- Closures and half days come from the Python holidays library (https://github.com/vacanza/holidays). MarketClock never stores its own copy of holiday dates.",
    "- Name, country and timezone of each market come from the exchange's website, with the source URL in the API response (source_url).",
    "- Trading days use closures only: a half day is still a trading day.",
    "- Session hours, early-close times and settlement cycles are stored with the exchange or regulator page they were read from. Markets without a confirmed source say so instead of guessing.",
    "- Official exchange calendars (NYSE 2026 to 2028, Nasdaq 2026, LSE 2027 and 2028) are compared day by day with the library; every date matched.",
    "",
    "## API",
    "",
    `Base URL: ${API}. JSON only, read-only, no key needed during the preview.`,
    "",
    ...ENDPOINTS.map(
      ([route, params, summary]) =>
        `- \`${route}\`${params ? ` (query: ${params})` : ""}: ${summary}`,
    ),
    "",
    "Rules:",
    "",
    "- Dates are ISO YYYY-MM-DD. Other forms, including Unix timestamps, are rejected.",
    "- Ranges include both ends and cover at most 400 days.",
    "- Unknown query parameters are rejected.",
    "- At most 120 requests a minute per client; responses carry RateLimit-Limit and RateLimit-Remaining.",
    "- Import /api/v1/openapi.json into Postman, Bruno or Insomnia for a ready-made collection.",
    "- Market codes are case-sensitive MICs.",
    "",
    "### Examples",
    "",
    "```",
    `GET ${API}/settlement?markets=XNYS,XLON&trade_date=2026-12-23&cycle=2`,
    '{"markets": ["XNYS", "XLON"], "trade_date": "2026-12-23", "cycle": 2, "cycle_from": "query", "default_cycles": [], "trade_date_is_trading_day": true, "settlement_date": "2026-12-29"}',
    "",
    `GET ${API}/markets/XNYS/status?at=2026-12-24T16:00:00Z`,
    '{"market": "XNYS", "state": "open", "detail": "early_close", "local_time": "2026-12-24T11:00:00-05:00", "closes_at": "2026-12-24T13:00:00-05:00", "opens_at": null}',
    "",
    `GET ${API}/markets/XNYS/is-trading-day?date=2026-07-03`,
    '{"market": "XNYS", "date": "2026-07-03", "is_trading_day": false}',
    "",
    `GET ${API}/markets/XSAU/next-trading-day?date=2026-10-29`,
    '{"market": "XSAU", "date": "2026-10-29", "trading_day": "2026-11-01"}',
    "",
    `GET ${API}/markets/XNYS/holidays?year=2026`,
    '{"market": "XNYS", "year": 2026, "holidays": [{"date": "2026-01-01", "name": "New Year\'s Day", "category": "public", "half_day": false, "close_time": null}, ...]}',
    "```",
    "",
    "### Errors",
    "",
    'Every error has the shape {"error": {"code", "message", "params"}}.',
    "",
    ...ERRORS.map(([code, status, meaning]) => `- \`${code}\` (${status}): ${meaning}`),
    "",
    "## Markets",
    "",
    ...(markets
      ? marketLines(markets)
      : [`The market list is at ${API}/markets and ${absoluteUrl("/markets")}.`]),
    "",
    "## Pages",
    "",
    ...PAGES.map((page) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`),
    "",
    "## URL patterns",
    "",
    ...urlPatterns(),
    "",
    "## Contact",
    "",
    `- Email: ${CONTACT.email}`,
    `- Source: ${CONTACT.github}`,
    `- Author: Syed Ahmer Shah, ${CONTACT.website}`,
    "",
  ].join("\n");
}
