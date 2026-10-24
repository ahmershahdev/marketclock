# AGENTS.md

Guide for coding agents and contributors. Short on purpose: details live in `docs/`, read only when
a task needs them. When a decision changes, update the matching doc in the same PR.

MarketClock: trading days, early closes, settlement dates and market overlap for the financial
markets in the Python [holidays](https://github.com/vacanza/holidays) library, as a REST API, a web
app and public calendar pages. Owner: Syed Ahmer Shah, <https://ahmershah.dev>.

## Read on demand

| Task touches | Read |
|---|---|
| Starting a session | [docs/status.md](docs/status.md) |
| What to build next, milestone scope | [docs/roadmap.md](docs/roadmap.md) |
| Endpoints, data model, data sources, decisions | [docs/architecture.md](docs/architecture.md) |

## Stack

Python 3.12, Flask, Pydantic, SQLAlchemy 2, Alembic, `holidays` (exact pin), MySQL 8 (utf8mb4;
never SQLite, even in tests), Redis. Next.js (App Router), TypeScript (strict), Tailwind CSS.
pytest, Vitest. Ruff, mypy (strict), ESLint, Prettier. Docker Compose.

## Layout (planned)

```
backend/app/        app factory, config, blueprints, schemas
backend/app/core/   pure date logic: no Flask or database imports, 100% branch coverage
backend/tests/      mirrors app/
frontend/           Next.js app
docs/               roadmap, architecture, status
```

## Hard rules

- `app/core` is plain Python; views only call it. Use the library's own logic (`weekend`,
  `is_working_day`, `get_nth_working_day`, `get_working_days_count`). Never copy holiday data.
- Every stored fact from outside the library (session hours, settlement cycles, official
  closures) has a source URL.
- Dates are `datetime.date`; timezones only for "open right now". Ranges include both ends and
  are capped.
- Validate market codes, dates and categories against the library.
- Secrets only from environment variables. Never commit `.env`, dumps or keys.
- API changes update the OpenAPI schema and the frontend client in the same PR.
- No new dependency without a reason in the PR. Pin exact versions.
- The maintainer must be able to explain every line; keep core logic small.
- No emojis in code, UI text or docs.

## Comments

Almost none. The default is no comment, and most files should have zero. Write one only when the
next reader would otherwise get it wrong: a library or framework trap, a data quirk, or a source
URL. One line, rarely two.

Never: docstrings that repeat the function name, comments that restate the code, section banners,
history ("changed from"), owner-less TODOs, or filler (simply, robust, seamless, ensure, leverage,
comprehensive). If a name or a small function can say it, rename instead of commenting.

## Workflow

- Branches `feat/…`, `fix/…`, `docs/…`, `chore/…`. `main` takes PRs only, squash-merged.
- Each PR belongs to a milestone and closes its issue when there is one.
- Commits are mid-sized: one coherent step that builds and passes checks on its own (a component
  with its styles, an endpoint with its tests, a config change). Not one giant commit per feature,
  not one commit per file.
- Commit messages: short, imperative, no prefixes.
- Update `docs/status.md` at the end of every session.
