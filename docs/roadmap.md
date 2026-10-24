# Roadmap

Each milestone is a set of small pull requests into `main`. A milestone is done when its
checklist is ticked, CI is green and [status.md](status.md) is updated. Target dates are plans,
not deadlines; GSoC and `holidays` pull requests come first.

Done for the whole project means: a live demo, a README with setup steps and screenshots, tests
in CI, and seed data.

## M1. Skeleton (target 2026-11-08)

- [ ] Flask app factory, config per environment (`dev`, `test`, `prod`), health endpoint
- [ ] SQLAlchemy 2 + Alembic against MySQL 8 in Docker Compose (MySQL in tests too, never SQLite)
- [ ] Redis in Compose, cache wrapper with a test double
- [ ] pytest with coverage, Ruff, mypy (strict)
- [ ] GitHub Actions: `backend` job, CodeQL; add both as required checks in the ruleset
- [ ] Dependabot for Actions and Python

## M2. Core API (target 2026-11-22)

- [ ] `GET /api/v1/markets`: code, name, country, timezone, weekend, supported categories
- [ ] `GET /api/v1/markets/<code>/holidays?year=`: closures and half days with names
- [ ] `GET /api/v1/markets/<code>/is-trading-day?date=`
- [ ] `GET /api/v1/markets/<code>/next-trading-day?date=` and `previous-trading-day`
- [ ] `GET /api/v1/markets/<code>/trading-days?start=&end=` (both ends included, range capped)
- [ ] Early closes from `HALF_DAY`, with closing times from market metadata
- [ ] Input validation (market code, dates, range caps), one error format
- [ ] Redis cache per (market, year, library version)
- [ ] OpenAPI schema committed, generated from the Pydantic models

## M3. Settlement (target 2026-12-06)

- [ ] Settlement cycle per market, stored with its source and effective date (cycles change,
  for example the US moved from T+2 to T+1)
- [ ] `GET /api/v1/settlement?market=&trade_date=&cycle=`
- [ ] Two-market settlement: the date must be a trading day on both markets
- [ ] `GET /api/v1/overlap?markets=&start=&end=`
- [ ] Domain logic in plain Python with 100% branch coverage, including year boundaries

## M4. Web app (target 2026-12-27)

- [ ] Next.js + TypeScript + Tailwind, typed API client generated from the OpenAPI schema
- [ ] Month view per market, with closures and early closes
- [ ] Settlement calculator and overlap tool
- [ ] Watchlist of upcoming closures (stored in the browser, no accounts)
- [ ] Server-rendered public pages per market and year, sitemap, titles and descriptions
- [ ] `frontend` CI job (lint, type check, Vitest, build), added as a required check

## M5. Data quality (target 2027-01-17)

- [ ] Official closures table: market, date, kind, source URL, date checked
- [ ] Comparison job: library dates against official dates, per market and year
- [ ] Data-quality page listing every difference with its source
- [ ] First markets: PSX (XKAR), Tadawul (XSAU), SIFMA (XSIF), then others as sources are found
- [ ] Each real difference becomes an issue or pull request on `vacanza/holidays`

## M6. Docs and launch (target 2027-02-07)

- [ ] README with screenshots, setup, API examples
- [ ] Seed data and a demo script
- [ ] Production Docker image, deploy next to HolidayOps (`marketclock.ahmershah.dev`)
- [ ] Lighthouse 90 or more on public pages
