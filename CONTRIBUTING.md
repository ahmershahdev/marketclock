# Contributing

MarketClock is in its planning stage. Issues and ideas are welcome; for code, please open an
issue first so we can agree on the approach.

## Wrong market dates

Closures and half days come from the [holidays](https://github.com/vacanza/holidays) library.
If a date is wrong, report it there, with a link to the exchange's own calendar.

## Pull requests

- One change per pull request, into `main`, squash-merged.
- Branch names: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Tests and linters must pass. Domain logic in `backend/app/core` needs 100% branch coverage.
- Every fact taken from outside the library (session hours, settlement cycles) needs a source URL.
- Read [AGENTS.md](AGENTS.md) for the code rules and [docs/](docs/) for the design.

## AI use

The maintainer uses an AI assistant for parts of the work and reviews, tests and can explain every
line that is merged.
