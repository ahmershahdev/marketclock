export const SITE_URL = (process.env.SITE_URL ?? "https://marketclock.ahmershah.dev").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "MarketClock";

export const SITE_DESCRIPTION =
  "Is the exchange open, does it close early, and when does a trade settle? Trading days and settlement dates for 30 exchanges.";

export const SITE_SUMMARY =
  "Trading days, early closes, settlement dates and market overlap for the stock exchanges and financial markets in the Python holidays library, as a REST API, a web app and public calendar pages.";

export const PAGES = [
  {
    path: "/",
    title: "Home",
    description: "What MarketClock answers, with live clocks for the main exchanges.",
  },
  {
    path: "/markets",
    title: "Markets",
    description: "Every supported market with its country, timezone and weekend.",
  },
  {
    path: "/tools/settlement",
    title: "Settlement calculator",
    description: "Settlement date for a trade on one market, or across two markets.",
  },
  {
    path: "/tools/overlap",
    title: "Market overlap",
    description: "Days on which every chosen market trades.",
  },
  {
    path: "/tools/business-days",
    title: "Business-day calculator",
    description: "Add or subtract trading days, or count trading days between two dates.",
  },
  {
    path: "/watchlist",
    title: "Watchlist",
    description: "Upcoming closures for the markets you follow, stored in your browser.",
  },
  {
    path: "/data-quality",
    title: "Data quality",
    description: "Library dates checked against each exchange's published calendar.",
  },
  {
    path: "/developers",
    title: "API",
    description: "Endpoints, parameters and rules of the MarketClock REST API.",
  },
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
