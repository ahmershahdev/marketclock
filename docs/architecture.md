# Architecture (planned)

This is the design before any code. Change it in the same pull request that changes the code.

## Parts

```
Next.js web app  ──>  Flask API  ──>  holidays library (closures, half days)
 (SSR pages,          (Pydantic,  ──>  MySQL (market metadata, settlement cycles,
  dashboard)           blueprints)        official closures, findings)
                                   ──>  Redis (cache)
```

The API is the only thing that talks to MySQL and Redis. The web app only calls the API.

## Where data comes from

| Data | Source | Stored in |
|---|---|---|
| Closures and half days | `holidays.financial_holidays(code, years=...)` | not stored, cached in Redis |
| Weekend days | the library's market class (`weekend`) | not stored |
| Timezone, session hours, early-close time | exchange websites | `market` table, with source URL |
| Settlement cycle | exchange or regulator notices | `settlement_cycle` table, with source and effective date |
| Official closures for comparison | exchange calendars and notices | `official_closure` table, with source and date checked |

Rule: holiday dates are never copied into MarketClock. The library is the single source; the
`official_closure` table exists only to check it.

## Data model (first draft)

- `market`: code (MIC, primary key), name, country, timezone, open time, close time, early close
  time, source URL
- `settlement_cycle`: market, days (`n` in T+n), effective from, source URL
- `official_closure`: market, date, kind (closed, half day), name, source URL, checked on
- `finding`: market, date, kind (missing in library, extra in library, name differs), status
  (open, reported, fixed upstream, not a bug), upstream link

## API rules

- Versioned under `/api/v1`. JSON only. One error shape: `{"error": {"code", "message", "params"}}`.
- Dates are ISO `YYYY-MM-DD` and plain dates in the domain; no timezone maths for day questions.
  Timezones are used only for "is the market open right now".
- Ranges include both ends and are capped (a year range of at most 10 years, a day range of at
  most 400 days).
- Market codes are validated against the library's supported markets.

## Decisions

| Decision | Why |
|---|---|
| Flask, not Django | HolidayOps already shows Django; Flask matches WP1 (Kiwix) and keeps the API small |
| Pydantic for validation and the schema | one model gives validation, errors and OpenAPI |
| No user accounts | the watchlist lives in the browser; nothing personal is stored |
| MySQL in tests | the same database as production, as in HolidayOps |
| Settlement cycles with effective dates | cycles change over time, so old trades must use the old cycle |
