# Project status

Last updated: 2026-10-25. Update at the end of every work session.

## Where we are

- 2026-10-25: tagged `v0.1.0` (pre-release) on `main`; `v1.0.0` is the February launch. GitHub wiki
  (11 pages) links back to `docs/`; release steps and wiki rules in [deploy.md](deploy.md#releases).
  Milestones M1 to M5 closed on GitHub; M6 stays open until the deploy.

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
- Custom scroll rail, 3D 404 and error pages (instanced three.js tiles), `global-error.tsx`,
  CSS 3D offline page with a service worker (checked: with the server stopped, navigation shows
  the styled offline page from cache).
- M3: `GET /api/v1/settlement` and `/overlap` (`app/core/settlement.py`); the web app tools work
  end to end. Brand emblem, gold accent and country flags merged in #8. 94 backend tests.
- M2 cache: holidays cached per (library version, market, year); outage-safe. 101 backend tests.
- Console and layout audit: every page checked at 390, 768 and 1536 px with no console errors and no horizontal overflow (fixed `/developers`). Widgets fail alone through `Boundary`.
- M3 cycles: `settlement_cycle` table, first Alembic migration, `flask seed`, `/markets/<code>/settlement-cycle`, Auto cycle in the calculator. 117 backend tests.
- M5: `official_closure` table and migration, comparison in `app/core/quality.py`, `/data-quality` page and endpoint. NYSE and LSE match the library. Scroll reveals moved to CSS (fixed a hydration mismatch). 126 backend tests.
- Lighthouse on the production images: accessibility and best practices 100 on every page; desktop performance 95 to 97 except home (76); mobile 50 to 73 and noisy locally. Fixed: layout shift 4.8 to 0 (globe), 77 s blocking time (software WebGL), muted-text contrast, table header, LCP held by faded headlines.
- New mark, favicon and app icons cut from the square emblem. Nasdaq and JPX hours and the Nasdaq 2026 calendar, read in Chrome (Tadawul and NSE still deny access, TSX and PSX sites down). Year URLs and `/holidays/<year>` indexes.
- SEO and security pass: every title 60 or less and description 140 or less, canonical, Open Graph and Twitter tags on every page, WebSite and WebApplication JSON-LD on home, breadcrumbs everywhere else; CSP, HSTS and the other headers on the web app and the API; Next.js data cache and API Cache-Control; llms files list the new URL patterns; AGENTS.md rewritten for the current project. A nonce CSP was built and tested, and rejected because prerendered shells cannot carry the nonce.
- Then: CSV downloads and a per-client rate limit (#26), watchlist notifications (#27), embeddable status widget.
- Since the M6 PR: icons cut from the square emblem (#21), Nasdaq and JPX hours and the Nasdaq 2026 calendar (#21), year URLs and `/holidays/<year>` (#21), iCalendar feeds (#22), open-now status with `tzdata` (#23), business-day calculator (#24).
- M6 prep: gunicorn, production Dockerfiles, `compose.prod.yaml` (checked locally), `images` CI workflow, `docs/deploy.md`, README rewritten with screenshots and Mermaid diagrams.
- Web app (M4 started early, merged in #1): grotesque type, lime theme, 3D globe hero, markets,
  calendars, tools, watchlist and API pages. Data views show an offline state until the M2
  endpoints exist.

## Next session

1. Data that needs a readable source: session hours for TSX (site down), Tadawul and NSE
   (Access Denied even in a real browser, probably by region), SGX; settlement cycles for PSX
   (site in maintenance), BSE/NSE, LSE T+2; official calendars for PSX and Tadawul.
2. February 2027: deploy with `docs/deploy.md` (the reverse proxy must set `X-Forwarded-For`
   for the rate limit), then Lighthouse on the live site (mobile was 50 to 73 locally) and
   Search Console.

## Open questions

- Session hours and early-close times per market: which official pages to use for each.
- `half_day` duplicates `category == "half_day"`; kept because the web app uses it. Drop one?
- `Market.weekend` as Python weekday numbers (Monday is 0): confirm when adding the markets
  endpoint.
- Settlement cycles: collect the official source and effective date per market before M3.
