# Project status

Last updated: 2026-10-24. Update at the end of every work session.

## Where we are

- M1 skeleton: Flask app factory, env config, SQLAlchemy engine, Alembic (no tables yet), Redis
  cache with an in-memory double, one error shape, `GET /api/v1/health`. Docker Compose runs
  MySQL 8.4, Redis 8.2 and the API. 19 tests against MySQL, 100% branch coverage, Ruff and mypy
  strict clean. CI: `backend`, `frontend` and `codeql` workflows; Dependabot covers Actions, pip,
  npm and Compose images.
- M2 part one: `app/core/calendar.py` (holidays, is-trading-day, next and previous trading day,
  trading days in a range) on the library's own working-day logic; endpoints under
  `/api/v1/markets/<code>/`; Pydantic query and response models; OpenAPI schema in
  `backend/openapi.json`, served at `/api/v1/openapi.json`; frontend types generated from it
  with `openapi-typescript`, checked in CI. 61 backend tests, 100% branch coverage.
- M2 part two: `GET /api/v1/markets` and `/markets/<code>` with name, country and timezone from
  `MARKET_INFO` (source URL per market); the web app shows live data. `next dev` fixed: the
  market page read the clock during prerender. Market picker is now a themed combobox instead
  of a native datalist; scrollbars follow the theme. `robots.txt`, `sitemap.xml`, `llms.txt`,
  `llms-full.txt` added. 71 backend tests, 21 frontend tests.
- Web app (M4 started early, merged in #1): grotesque type, lime theme, 3D globe hero, markets,
  calendars, tools, watchlist and API pages. Data views show an offline state until the M2
  endpoints exist.

## Next session

1. M2: Redis cache per (market, year, library version).
2. M2: session hours and early-close times (`market` table with source URLs, Alembic migration),
   then fill `close_time` on half days.
3. M3: settlement and overlap endpoints; the web app tools show an error until then.

## Open questions

- Session hours and early-close times per market: which official pages to use for each.
- `half_day` duplicates `category == "half_day"`; kept because the web app uses it. Drop one?
- `Market.weekend` as Python weekday numbers (Monday is 0): confirm when adding the markets
  endpoint.
- Settlement cycles: collect the official source and effective date per market before M3.
