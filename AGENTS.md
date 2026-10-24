# AGENTS.md

Guide for coding agents and contributors. Short on purpose: details live in `docs/`, read only when
a task needs them. When a decision changes, update the matching doc in the same PR.

MarketClock: trading days, early closes, settlement dates, live open status and market overlap for
the 30 markets in the Python [holidays](https://github.com/vacanza/holidays) library, as a REST API,
a web app and public calendar pages. Owner: Syed Ahmer Shah, <https://ahmershah.dev>. Goes live at
`marketclock.ahmershah.dev` in February 2027.

## Read on demand

| Task touches | Read |
|---|---|
| Starting a session | [docs/status.md](docs/status.md) |
| What is done and what is left | [docs/roadmap.md](docs/roadmap.md) |
| Endpoints, data model, sources, every decision | [docs/architecture.md](docs/architecture.md) |
| Server, reverse proxy, releases | [docs/deploy.md](docs/deploy.md) |

## Stack

Python 3.12, Flask 3.1, Pydantic 2, SQLAlchemy 2, Alembic, `holidays` 0.107 (exact pin), `tzdata`,
gunicorn, MySQL 8.4 (utf8mb4; never SQLite, even in tests), Redis 8.2. Next.js 16 (App Router,
Cache Components), React 19, TypeScript (strict), Tailwind CSS 4, three.js with React Three Fiber.
pytest, Vitest, Ruff, mypy (strict), ESLint, Prettier. Docker Compose for dev and prod.

## Layout

```
backend/app/core/    pure date logic (calendar, settlement, status, data quality, iCalendar,
                     market details and sources): no Flask or database imports, 100% branch coverage
backend/app/api/     Flask blueprints, one per area
backend/app/         factory, config, models, schemas, OpenAPI, cache, rate limit, headers, seed
backend/migrations/  Alembic; backend/openapi.json is generated, never edited by hand
frontend/src/app/    routes, proxy redirects, robots, sitemap, llms files, embed, error pages
frontend/src/lib/    API client and generated schema types, server data cache, SEO helpers
docs/                roadmap, architecture, status, deploy, screenshots
```

## Commands

- Backend: `.venv/Scripts/pytest`, `ruff check .`, `ruff format --check .`, `mypy`.
  After a model change: `python write_openapi.py`. Data: `alembic upgrade head`, `flask --app wsgi seed`.
- Frontend: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
  After an API change: `npm run api:types`.
- If `next dev` serves code you already changed, stop it, delete `frontend/.next` and start again.

## Hard rules

- `app/core` is plain Python; views only call it. Use the library's own logic (`weekend`,
  `is_working_day`, `get_nth_working_day`). Never copy holiday data.
- Every stored fact from outside the library (session hours, settlement cycles, official
  closures) has a source URL whose page was opened and read. Unverifiable means left out, never
  guessed; the UI says "not on file".
- Dates are `datetime.date`, ISO `YYYY-MM-DD` only; timezones only for "open right now". Ranges
  include both ends and are capped. Settlement cycles are looked up by trade date.
- Validate market codes (MIC only), dates and query parameters against the library and Pydantic.
- API changes update `openapi.json` and the generated frontend types in the same PR; CI checks both.
- Every page title is 60 characters or less with the suffix, every description 140 or less; set
  them through `pageMetadata` in `lib/seo.ts`, with breadcrumb JSON-LD.
- Security headers live in `next.config.ts` (web) and `app/headers.py` (API). Script CSP allows
  inline scripts because prerendered shells cannot carry a per-request nonce; do not add a nonce
  policy without making every route dynamic.
- Redirects go in `src/proxy.ts`: inside a streamed page they arrive after a 200.
- Entrance animations transform only, never fade from opacity 0 (it delays LCP and fails contrast).
  3D scenes stay behind `useDeferredWebGL` and a `Boundary`.
- Secrets only from environment variables. Never commit `.env`, dumps or keys.
- No new dependency without a reason in the PR. Pin exact versions. npm majors are manual.
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

- Branches `feat/…`, `fix/…`, `docs/…`, `chore/…`. `main` takes PRs only, squash-merged, and
  the branch is deleted after the merge. Keep at most one open branch and PR at a time.
- Required checks before merging: `backend`, `frontend`, `images` and `codeql` for each language.
- Each PR belongs to a milestone and closes its issue when there is one.
- Commits are mid-sized: one coherent step that builds and passes checks on its own (a component
  with its styles, an endpoint with its tests, a config change). Not one giant commit per feature,
  not one commit per file.
- Commit messages: short, imperative, no prefixes.
- Never credit an AI assistant: no `Co-Authored-By` trailers, no AI names in commits, PRs,
  README, contributors lists or code headers. The maintainer is the only author.
- Keep `README.md` current in the same PR as the change: status line, features that exist, setup
  steps, scripts and stack versions.
- Layout or route changes: check every page at 390 and 768 px for horizontal overflow and console
  errors before merging.
- Update `docs/status.md` at the end of every session.
