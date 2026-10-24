# MarketClock

**Every trading day, every settlement date.**

MarketClock answers the questions a trading desk or back office asks every day: is this exchange
open today, does it close early, and when does a trade settle? It covers the stock exchanges and
financial markets in the Python [holidays](https://github.com/vacanza/holidays) library (NYSE,
NASDAQ, LSE, PSX, Tadawul, SIFMA and more), through a REST API, a web dashboard and public
calendar pages.

> Status: early build. The API skeleton (M1) and the web app shell exist. See [docs/roadmap.md](docs/roadmap.md) for the
> milestones and [docs/status.md](docs/status.md) for where the work is.

## What it will do

- **Trading days.** Is a market open on a date, the next and previous trading day, and trading
  days in a range, with each market's own weekend (Friday and Saturday for Tadawul, Saturday
  and Sunday for most others).
- **Early closes.** Half-day sessions from the library's `HALF_DAY` category, with the closing
  time.
- **Settlement dates.** `T+n` for a trade on one market, or across two markets, where the
  settlement day must be open on both.
- **Market overlap.** Days when two or more markets are all open.
- **Dashboard.** A month view per market and a watchlist of upcoming closures.
- **Public pages.** One page per market and year ("PSX holidays 2027"), rendered on the server
  for search engines.
- **Data quality.** Each market's dates compared with the calendar the exchange publishes,
  with every difference listed and linked to its source. Real differences go back to the
  `holidays` library as pull requests.

## Stack

| Part | Tools |
|---|---|
| API | Python 3.12, Flask (app factory, blueprints), Pydantic, SQLAlchemy 2, Alembic |
| Data | MySQL 8, Redis (cache), `holidays` (exact pin) |
| Web | Next.js (App Router), TypeScript (strict), Tailwind CSS |
| Quality | pytest, Vitest, Ruff, mypy, ESLint, Prettier, GitHub Actions, CodeQL |
| Run | Docker Compose |

## Run locally

Needs Docker, Python 3.12 and Node 22.

```bash
cp .env.example .env              # then set your own passwords
docker compose up -d              # MySQL, Redis and the API on http://localhost:5000
curl http://localhost:5000/api/v1/health

cd backend                        # tests and linters on the host
py -3.12 -m venv .venv && .venv/Scripts/pip install -r requirements-dev.txt
.venv/Scripts/pytest && .venv/Scripts/ruff check . && .venv/Scripts/mypy
```

On macOS or Linux use `python3.12` and `.venv/bin/`. Migrations: `docker compose exec api
alembic upgrade head`.

## Why it exists

The `holidays` library knows when markets are closed, but traders need answers built on top of
that: settlement dates, overlaps, early-close times, and proof that the dates match what the
exchange published. MarketClock is that layer, and its data-quality checks feed fixes back into
the library.

## Documentation

- [docs/roadmap.md](docs/roadmap.md): milestones M1 to M6 and what "done" means
- [docs/architecture.md](docs/architecture.md): planned API, data model and decisions
- [docs/status.md](docs/status.md): current state, updated every session
- [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md)

## Related

- [HolidayOps](https://github.com/ahmershahdev/holidayops): business-day calendars for countries
  and companies, built on the same library.

## License

[MIT](LICENSE). Holiday data comes from the `holidays` library (MIT).

Built by [Syed Ahmer Shah](https://ahmershah.dev).
