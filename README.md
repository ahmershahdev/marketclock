# MarketClock

**Every trading day, every settlement date.**

[![backend](https://github.com/ahmershahdev/marketclock/actions/workflows/backend.yml/badge.svg)](https://github.com/ahmershahdev/marketclock/actions/workflows/backend.yml)
[![frontend](https://github.com/ahmershahdev/marketclock/actions/workflows/frontend.yml/badge.svg)](https://github.com/ahmershahdev/marketclock/actions/workflows/frontend.yml)
[![codeql](https://github.com/ahmershahdev/marketclock/actions/workflows/codeql.yml/badge.svg)](https://github.com/ahmershahdev/marketclock/actions/workflows/codeql.yml)

MarketClock answers the questions a trading desk or back office asks every day: is this exchange
open today, does it close early, and when does a trade settle? It covers the stock exchanges and
financial markets in the Python [holidays](https://github.com/vacanza/holidays) library (NYSE,
NASDAQ, LSE, PSX, Tadawul, SIFMA and more), through a REST API, a web app and public calendar
pages.

> Status: early build. M1 (API skeleton) is done, M2 is under way: holidays and trading-day
> endpoints work, the markets list and caching come next. The web app shell from M4 is in place.
> See [docs/roadmap.md](docs/roadmap.md) and [docs/status.md](docs/status.md).

## What works today

- **API skeleton.** Flask app factory, config per environment, MySQL through SQLAlchemy 2 and
  Alembic, Redis cache, one JSON error shape, and `GET /api/v1/health` (503 when MySQL or Redis
  is down).
- **Holidays and trading days.** For each of the 30 markets in the library: closures and half
  days of a year, whether a date is a trading day, the next and previous trading day, and the
  trading days in a range (both ends included, at most 400 days). Each market uses its own
  weekend. Inputs are checked: MIC codes only, ISO dates, years the library has data for.
- **OpenAPI schema.** Generated from the Pydantic models, committed as `backend/openapi.json`,
  served at `/api/v1/openapi.json`, and turned into the web app's TypeScript types.
- **Web app.** Landing page with a 3D globe (three.js), live clocks and a weekend demo; markets
  list, per-market year calendar, settlement and overlap tools, a browser-only watchlist and an
  API reference. Light, dark and system themes.
- **Quality.** Backend tests run against real MySQL with 100% branch coverage; frontend has
  Vitest, ESLint, Prettier and a strict type check. CI runs all of it plus CodeQL on every PR.

## What it will do

- **Markets list.** Code, name, country, timezone and weekend for every market.
- **Early-close times.** Half days are listed today; the closing time per market comes with the
  market metadata.
- **Settlement dates.** `T+n` for a trade on one market, or across two markets, where the
  settlement day must be open on both.
- **Market overlap.** Days when two or more markets are all open.
- **Public pages.** One page per market and year ("PSX holidays 2027"), rendered on the server
  for search engines.
- **Data quality.** Each market's dates compared with the calendar the exchange publishes,
  with every difference listed and linked to its source. Real differences go back to the
  `holidays` library as pull requests.

## Stack

| Part | Tools |
|---|---|
| API | Python 3.12, Flask 3.1, Pydantic 2.14, SQLAlchemy 2.1, Alembic 1.20, PyMySQL |
| Data | MySQL 8.4, Redis 8.2, `holidays` 0.107 (exact pin) |
| Web | Next.js 16.4, React 19.3, TypeScript 5.9 (strict), Tailwind CSS 4.3, three.js with React Three Fiber |
| Quality | pytest, Vitest, Ruff, mypy (strict), ESLint, Prettier, GitHub Actions, CodeQL |
| Run | Docker Compose |

## Run locally

Needs Docker, Python 3.12 and Node 22.

```bash
cp .env.example .env              # then set your own passwords
docker compose up -d              # MySQL, Redis and the API on http://localhost:5000
curl http://localhost:5000/api/v1/health
curl "http://localhost:5000/api/v1/markets/XNYS/holidays?year=2026"

cd frontend
npm install
npm run dev                       # web app on http://localhost:3000
```

The web app reads `API_URL` (default `http://localhost:5000`); see
[frontend/README.md](frontend/README.md).

### Tests and linters

```bash
cd backend                        # Windows; on macOS or Linux use python3.12 and .venv/bin/
py -3.12 -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/pytest              # needs the Compose MySQL and TEST_DATABASE_URL from .env
.venv/Scripts/ruff check . && .venv/Scripts/ruff format --check . && .venv/Scripts/mypy

cd ../frontend
npm run lint && npm run typecheck && npm test && npm run build
```

Migrations: `docker compose exec api alembic upgrade head`.

After changing an API model, regenerate the schema and the web app types in the same PR (CI
checks both):

```bash
cd backend && .venv/Scripts/python write_openapi.py
cd ../frontend && npm run api:types
```

## Layout

```
backend/app/        Flask app factory, config, database, cache, errors, API blueprints
backend/app/core/   pure date logic on top of the holidays library, 100% branch coverage
backend/tests/      pytest, against MySQL
backend/migrations/ Alembic
frontend/           Next.js web app
docs/               roadmap, architecture, status
compose.yaml        MySQL, Redis and the API for local work
```

## Why it exists

The `holidays` library knows when markets are closed, but traders need answers built on top of
that: settlement dates, overlaps, early-close times, and proof that the dates match what the
exchange published. MarketClock is that layer, and its data-quality checks feed fixes back into
the library.

## Documentation

- [docs/roadmap.md](docs/roadmap.md): milestones M1 to M6 and what "done" means
- [docs/architecture.md](docs/architecture.md): API, data model and decisions
- [docs/status.md](docs/status.md): current state, updated every session
- [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md)

## Related

- [HolidayOps](https://github.com/ahmershahdev/holidayops): business-day calendars for countries
  and companies, built on the same library.

## Contact

- Email: [support@ahmershah.dev](mailto:support@ahmershah.dev) (security reports: see
  [SECURITY.md](SECURITY.md))
- LinkedIn: [syedahmershah](https://www.linkedin.com/in/syedahmershah)
- Website: [ahmershah.dev](https://ahmershah.dev)

## License

[MIT](LICENSE). Holiday data comes from the `holidays` library (MIT).

Built by [Syed Ahmer Shah](https://ahmershah.dev).
