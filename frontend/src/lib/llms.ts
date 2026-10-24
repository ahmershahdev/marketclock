import type { Market } from "@/lib/api/types";
import { weekendLabel } from "@/lib/calendar";
import { CONTACT } from "@/lib/contact";
import { absoluteUrl, PAGES, SITE_NAME, SITE_SUMMARY } from "@/lib/site";

const API = absoluteUrl("/api/v1");

const ENDPOINTS = [
  ["GET /markets", "", "Every market: code, name, country, timezone, weekend, categories."],
  ["GET /markets/{code}", "", "One market, with the years the library has data for."],
  ["GET /markets/{code}/holidays", "year", "Closures and half days of one year, with names."],
  ["GET /markets/{code}/is-trading-day", "date", "Whether the market trades on a date."],
  ["GET /markets/{code}/next-trading-day", "date", "First trading day after a date."],
  ["GET /markets/{code}/previous-trading-day", "date", "Last trading day before a date."],
  [
    "GET /markets/{code}/trading-days",
    "start, end",
    "Trading days in a range, both ends included.",
  ],
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
] as const;

function marketLines(markets: Market[]): string[] {
  return markets.map(
    (m) =>
      `- [${m.code}](${absoluteUrl(`/markets/${m.code}`)}): ${m.name}, ${m.country}. Timezone ${m.timezone}, weekend ${weekendLabel(m.weekend)}, data ${m.first_year} to ${m.last_year}.`,
  );
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
    "- Planned: settlement dates (T+n on one or two markets) and days when several markets are all open.",
    "",
    "## Data",
    "",
    "- Closures and half days come from the Python holidays library (https://github.com/vacanza/holidays). MarketClock never stores its own copy of holiday dates.",
    "- Name, country and timezone of each market come from the exchange's website, with the source URL in the API response (source_url).",
    "- Trading days use closures only: a half day is still a trading day.",
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
    "- Market codes are case-sensitive MICs.",
    "",
    "### Examples",
    "",
    "```",
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
    "## Contact",
    "",
    `- Email: ${CONTACT.email}`,
    `- Source: ${CONTACT.github}`,
    `- Author: Syed Ahmer Shah, ${CONTACT.website}`,
    "",
  ].join("\n");
}
