# Roadmap

Each milestone is a set of small pull requests into `main`. A milestone is done when its
checklist is ticked, CI is green and [status.md](status.md) is updated. Target dates are plans,
not deadlines; GSoC and `holidays` pull requests come first.

Done for the whole project means: a live demo, a README with setup steps and screenshots, tests
in CI, and seed data.

## M1. Skeleton (target 2026-11-08)

- [x] Flask app factory, config per environment (`dev`, `test`, `prod`), health endpoint
- [x] SQLAlchemy 2 + Alembic against MySQL 8 in Docker Compose (MySQL in tests too, never SQLite)
- [x] Redis in Compose, cache wrapper with a test double
- [x] pytest with coverage, Ruff, mypy (strict)
- [x] GitHub Actions: `backend` job, CodeQL; add both as required checks in the ruleset
- [x] Dependabot for Actions and Python

## M2. Core API (target 2026-11-22)

- [x] `GET /api/v1/markets`: code, name, country, timezone, weekend, supported categories
- [x] `GET /api/v1/markets/<code>/holidays?year=`: closures and half days with names
- [x] `GET /api/v1/markets/<code>/is-trading-day?date=`
- [x] `GET /api/v1/markets/<code>/next-trading-day?date=` and `previous-trading-day`
- [x] `GET /api/v1/markets/<code>/trading-days?start=&end=` (both ends included, range capped)
- [x] Early closes from `HALF_DAY`, with closing times from market metadata (XNYS, XHKG, XLON on
  file; XASX hours without an early close)
- [x] Input validation (market code, dates, range caps), one error format
- [x] Redis cache per (market, year, library version)
- [x] OpenAPI schema committed, generated from the Pydantic models

## M3. Settlement (target 2026-12-06)

- [x] Settlement cycle per market, stored with its source and effective date (cycles change,
  for example the US moved from T+2 to T+1). On file: XNYS, XNAS, XTSE, XLON (from 2027).
  More markets as their regulator pages are confirmed.
- [x] `GET /api/v1/settlement?markets=&trade_date=&cycle=`
- [x] Two-market settlement: the date must be a trading day on both markets
- [x] `GET /api/v1/overlap?markets=&start=&end=`
- [x] Domain logic in plain Python with 100% branch coverage, including year boundaries

## M4. Web app (target 2026-12-27)

- [x] Next.js + TypeScript + Tailwind, typed API client generated from the OpenAPI schema
- [x] Month view per market, with closures and early closes
- [x] Settlement calculator and overlap tool
- [x] Watchlist of upcoming closures (stored in the browser, no accounts)
- [ ] Server-rendered public pages per market and year, sitemap, titles and descriptions
  (sitemap, robots.txt, llms.txt and llms-full.txt done)
- [x] `frontend` CI job (lint, type check, Vitest, build), added as a required check

## M5. Data quality (target 2027-01-17)

- [x] Official closures table: market, date, kind, source URL, date checked
- [x] Comparison: library dates against official dates, per market and whole year
- [x] Data-quality page listing every difference with its source
- [x] First markets: NYSE (2026 to 2028) and LSE (2027 and 2028), both matching the library.
  SIFMA is not in `holidays` 0.107; PSX and Tadawul pages could not be read from here.
- [ ] Each real difference becomes an issue or pull request on `vacanza/holidays` (none found yet)

## M6. Docs and launch (target 2027-02-07)

- [ ] README with screenshots, setup, API examples
- [ ] Seed data and a demo script
- [ ] Production Docker image, deploy next to HolidayOps (`marketclock.ahmershah.dev`)
- [ ] Lighthouse 90 or more on public pages
