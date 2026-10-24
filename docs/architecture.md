# Architecture

The design, partly built. Change it in the same pull request that changes the code.

## Parts

```
Next.js web app  ──>  Flask API  ──>  holidays library (closures, half days)
 (SSR pages,          (Pydantic,  ──>  MySQL (market metadata, settlement cycles,
  dashboard)           blueprints)        official closures, findings)
                                   ──>  Redis (cache)
```

The API is the only thing that talks to MySQL and Redis. The web app only calls the API.

## Where data comes from

| Data | Source | Stored in |
|---|---|---|
| Closures and half days | `holidays.financial_holidays(code, years=...)` | not stored, cached in Redis |
| Weekend days | the library's market class (`weekend`) | not stored |
| Name, country, timezone | exchange websites | `app/core/markets.py` (`MARKET_INFO`), with source URL |
| Session hours, early-close time | exchange websites | `market` table, with source URL (not built yet) |
| Settlement cycle | exchange or regulator notices | `settlement_cycle` table, with source and effective date |
| Official closures for comparison | exchange calendars and notices | `official_closure` table, with source and date checked |

Rule: holiday dates are never copied into MarketClock. The library is the single source; the
`official_closure` table exists only to check it.

## Data model (first draft)

- `market`: code (MIC, primary key), name, country, timezone, open time, close time, early close
  time, source URL
- `settlement_cycle`: market, days (`n` in T+n), effective from, source URL
- `official_closure`: market, date, kind (closed, half day), name, source URL, checked on
- `finding`: market, date, kind (missing in library, extra in library, name differs), status
  (open, reported, fixed upstream, not a bug), upstream link

## API rules

- Versioned under `/api/v1`. JSON only. One error shape: `{"error": {"code", "message", "params"}}`.
- Dates are ISO `YYYY-MM-DD` and plain dates in the domain; no timezone maths for day questions.
  Timezones are used only for "is the market open right now".
- Ranges include both ends and are capped (a year range of at most 10 years, a day range of at
  most 400 days).
- Market codes are validated against the library's supported markets: the MIC only (`XNYS`),
  case-sensitive. Library aliases such as `NYSE` get a 404, so each market has one URL.
- Years outside the library's data for a market (`start_year` to `end_year`) are a 400, not an
  empty answer that would make every weekday look like a trading day.
- Trading days come from the `public` category only; `half_day` dates are still trading days.
- Errors: `invalid_parameter` (400, `params.fields`), `unknown_market` (404),
  `year_out_of_range` (400), `invalid_range` (400), `invalid_markets` (400).
- Settlement: T+n is the n-th day after the trade date on which every listed market is open.
  T+0 is the trade date when all markets are open, otherwise the next such day. The cycle is
  a query parameter (0 to 10); stored per-market cycles come later.

## Decisions

| Decision | Why |
|---|---|
| Flask, not Django | HolidayOps already shows Django; Flask matches WP1 (Kiwix) and keeps the API small |
| Pydantic for validation and the schema | one model gives validation, errors and OpenAPI |
| No user accounts | the watchlist lives in the browser; nothing personal is stored |
| MySQL in tests | the same database as production, as in HolidayOps |
| Settlement cycles with effective dates | cycles change over time, so old trades must use the old cycle |
| Web app calls the API through a Next.js rewrite | `/api/v1/*` is proxied to `API_URL`, so the API needs no CORS setup |
| Theme set by an inline head script | `data-theme` is applied before first paint, so no flash; choice kept in `localStorage` |
| Plain SQLAlchemy 2, not Flask-SQLAlchemy | one fewer dependency; the engine lives in `app.extensions["engine"]` |
| Config from environment variables only | `MARKETCLOCK_ENV` picks `dev`, `test` or `prod`; tests refuse a database not ending in `_test` |
| Own in-memory cache double, not fakeredis | the cache interface is three methods; the double also simulates an outage |
| `GET /api/v1/health` returns 503 when MySQL or Redis is down | lets Compose, CI and the deploy check readiness |
| OpenAPI document built in `app/openapi.py` from the Pydantic models, no Flask OpenAPI plugin | the models already give the JSON Schema; a list of five operations is easier to read than a plugin's decorators |
| `backend/openapi.json` is committed and checked by a test | the frontend generates its types from it, and a diff shows every API change in review |
| Frontend types from `openapi-typescript` (types only, no runtime client) | the existing `fetch` wrapper stays; CI regenerates `schema.ts` and fails on a diff |
| Market name, country and timezone in code, not MySQL | 30 rows that change only with the library; reviewed in pull requests; a test fails when the library adds a market without them |
| `sitemap.xml`, `llms.txt` and `llms-full.txt` render per request | at build time the API is usually down, so a prerendered file would have no markets |
| Site address from `SITE_URL` (default `https://marketclock.ahmershah.dev`) | one value for the sitemap, robots.txt, llms files and `metadataBase` |
| Hand-written service worker (`public/sw.js`), no PWA plugin | it does two things: serve `/offline` when a navigation fails, and cache hashed `/_next/static` files; registered in production only |
| Offline page in CSS 3D, not WebGL | it must render from the cached HTML and stylesheet alone, without the app's JavaScript |
| Custom scroll rail only on `(hover: hover) and (pointer: fine)` | touch devices and visitors without JavaScript keep the native scrollbar; the page still scrolls natively, so keyboard and assistive tech are unaffected |
| Country flags as 25 vendored SVGs from flag-icons (MIT), not emoji or a package | Windows shows emoji flags as letters; a package would ship every country; exchange logos are trademarks, so markets get flags only |
| Accent is the emblem's gold (`#ffd21f`), darker gold (`#8a6400`) for text on light backgrounds | one brand colour; the dark gold keeps AA contrast on the light theme |
| Holidays cached under `holidays:<library version>:<market>:<year>` for 7 days | a library upgrade changes the key, so stale dates are never served; a Redis outage falls back to computing, and `X-Cache` says hit or miss |
| No email features | no accounts and nothing personal is stored; contact is a `mailto:` link. Closure alerts by email would need consent, unsubscribe and a provider, so they wait until someone asks |
| Query dates must be `YYYY-MM-DD` | Pydantic alone accepts some Unix timestamps as dates |
| Holiday names in English (`en_US`) when the library has them | otherwise Tadawul names come back in Arabic |
