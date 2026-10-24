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
| Session hours, early-close time | exchange websites | `app/core/markets.py` (`SESSIONS`), with source URL; XNYS, XHKG, XASX, XLON |
| Settlement cycle | exchange or regulator notices | `settlement_cycle` table, with source and effective date |
| Official closures for comparison | exchange calendars and notices | `official_closure` table, with source and date checked |

Rule: holiday dates are never copied into MarketClock. The library is the single source; the
`official_closure` table exists only to check it.

## Data model (first draft)

- `market`: code (MIC, primary key), name, country, timezone, open time, close time, early close
  time, source URL
- `settlement_cycle` (built): market, days (`n` in T+n), effective from, source URL; unique on
  (market, effective from). Loaded by `flask --app wsgi seed` from `app/seed.py`, which only
  holds rows whose source page was read and confirmed.
- `official_closure` (built): market, date, kind (closed, half day), name, source URL, checked on;
  unique on (market, date). Only whole years are stored, so a year present is compared in full.
- Differences are computed on request by `app/core/quality.py` (missing in library, extra in
  library, closed or half day differs). A stored `finding` table with upstream status waits
  until there is a real difference to track.

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
  a query parameter (0 to 10). Without it, each market's cycle in force on the trade date is
  looked up and the longest one is used; a market with none on file is a 400
  (`no_default_cycle`).

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
| Scroll reveals with CSS `animation-timeline: view()`, no observer script | a script that marks elements before hydration causes React mismatches; browsers without support show content at once |
| `Boundary` around 3D scenes and demos, root `error.tsx` around pages | a missing WebGL context or a failed chunk download hides one widget instead of the page; a page error keeps the header and footer |
| `THREE.Clock` deprecation warning left in place | it comes from `@react-three/fiber` 9.8.2 (latest stable); the fix is only in the v10 alpha |
| gunicorn for the API, Next.js `output: "standalone"` for the web app | small non-root images; the web image needs no `node_modules` at run time |
| Migrations and seed run on every API start in production | both are idempotent, so a deploy is one `docker compose up -d --build` |
| 3D scenes only on wide screens with a mouse and hardware WebGL, mounted when idle; CSS poster otherwise | three.js is about 900 KB, and software WebGL blocked the main thread for over a minute in audits |
| Entrance animations use transforms only, no opacity | faded text is skipped as the LCP and fails contrast checks |
| Year in the path (`/markets/XNYS/2027`), `?year=` redirected with a 308 in `src/proxy.ts` | each year is its own indexable page; redirects run before rendering, because inside a streamed page they arrive after a 200 |
| iCalendar feed built in `app/core/ics.py`, no calendar library | all-day events with stable UIDs, escaping and 75-octet folding are a few lines; the feed rolls over to this year and next so a subscription never goes stale |
| Open-now status computed by the API (`app/core/status.py`, `zoneinfo` with pinned `tzdata`) | one tested place for timezone maths; `tzdata` gives Windows a timezone database and every host the same rules |
| A trading day without session hours is `hours_unknown`, not open | no guessing hours; weekends and holidays still come from the library |
| Rate limit in Flask on Redis (`INCR` per client per minute), no Flask-Limiter | a fixed window is a few lines; it keys on the last `X-Forwarded-For` entry set by our reverse proxy, skips internal callers (the web app's server-side calls), and lets requests through if Redis is down |
| No hand-made Postman collection | clients import `openapi.json` directly, so there is nothing to drift |
| Watchlist alerts as browser notifications while a tab is open, no Web Push | push needs a server that stores a subscription per visitor; checking on load and every 30 minutes keeps everything in the browser |
| Embed widget as a route handler returning one self-contained HTML card | no app JavaScript inside other people's pages; it refreshes with a meta tag and is `noindex` so it does not compete with market pages |
| No email features | no accounts and nothing personal is stored; contact is a `mailto:` link. Closure alerts by email would need consent, unsubscribe and a provider, so they wait until someone asks |
| Query dates must be `YYYY-MM-DD` | Pydantic alone accepts some Unix timestamps as dates |
| Holiday names in English (`en_US`) when the library has them | otherwise Tadawul names come back in Arabic |
