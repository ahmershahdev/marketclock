# Project status

Last updated: 2026-10-24. Update at the end of every work session.

## Where we are

The web app shell from M4 was started early, on branch `feat/frontend-shell`, so the design
system exists before the API: `frontend/` (Next.js 16, Tailwind 4) with the landing page,
markets list, market year calendar, settlement and overlap tools, watchlist and API reference,
light, dark and system themes. Every data view calls the planned `/api/v1` endpoints and shows
an "API not reachable" state until the API exists; no holiday data lives in the frontend.
Lint, type check, Vitest and `next build` pass. No backend code yet.

## Next session

1. Review and merge `feat/frontend-shell` (no `frontend` CI job yet; add it with M4).
2. M1: Flask app factory, Docker Compose with MySQL 8 and Redis, pytest, Ruff, mypy.
3. Add the `backend` and `codeql` CI jobs, then make them required checks in the "Protect main"
   ruleset (`.github/rulesets/protect-main.json` and the repository settings).

## Open questions

- Session hours and early-close times per market: which official pages to use for each.
- API field names in `frontend/src/lib/api/types.ts` are a draft (`half_day`, `close_time`,
  `weekend` as Python weekday numbers). Confirm them when writing the M2 Pydantic models.
- Settlement cycles: collect the official source and effective date per market before M3.
