# Project status

Last updated: 2026-10-24. Update at the end of every work session.

## Where we are

- M1 skeleton: Flask app factory, env config, SQLAlchemy engine, Alembic (no tables yet), Redis
  cache with an in-memory double, one error shape, `GET /api/v1/health`. Docker Compose runs
  MySQL 8.4, Redis 8.2 and the API. 19 tests against MySQL, 100% branch coverage, Ruff and mypy
  strict clean. CI: `backend`, `frontend` and `codeql` workflows; Dependabot covers Actions, pip,
  npm and Compose images.
- Web app (M4 started early, merged in #1): grotesque type, lime theme, 3D globe hero, markets,
  calendars, tools, watchlist and API pages. Data views show an offline state until the M2
  endpoints exist.

## Next session

1. M2: market list and holidays endpoints with Pydantic models and the OpenAPI schema.
2. Replace the hand-written frontend API types with ones generated from that schema.

## Open questions

- Session hours and early-close times per market: which official pages to use for each.
- API field names in `frontend/src/lib/api/types.ts` are a draft (`half_day`, `close_time`,
  `weekend` as Python weekday numbers). Confirm them when writing the M2 Pydantic models.
- Settlement cycles: collect the official source and effective date per market before M3.
