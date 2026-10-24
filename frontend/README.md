# MarketClock web app

Next.js (App Router, Cache Components), TypeScript strict, Tailwind CSS 4.

## Run

```bash
npm install
cp .env.example .env.local   # optional, defaults to http://localhost:5000
npm run dev                  # http://localhost:3000
```

Pages that need data (markets, calendars, tools, watchlist) show an "API not reachable" state
until the Flask API runs at `API_URL`. Browser requests to `/api/v1/*` are rewritten to the API
by `next.config.ts`, so the API needs no CORS setup.

## Scripts

| Script              | Does                                      |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | dev server                                |
| `npm run build`     | production build                          |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | route types, then `tsc --noEmit`          |
| `npm test`          | Vitest                                    |
| `npm run format`    | Prettier (with the Tailwind class sorter) |

## Layout

```
src/app/            routes: /, /markets, /markets/[code], /tools/settlement, /tools/overlap,
                    /watchlist, /developers
src/components/     shared UI (header, theme toggle, month grid, clocks)
src/lib/            calendar maths, theme, API client and types, watchlist store
```

## Theme

Colours are CSS variables in `src/app/globals.css`, switched by `data-theme` on `<html>`. A
script in `<head>` (`src/lib/theme.ts`) sets it before first paint from `localStorage` or the
system preference, so there is no flash. The toggle offers System, Light and Dark.

## API types

`src/lib/api/types.ts` is a hand-written draft of the planned contract. Replace it with types
generated from the OpenAPI schema when the API lands (roadmap M2 and M4).
