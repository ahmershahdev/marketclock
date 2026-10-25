# Deploy

Target: `marketclock.ahmershah.dev`, on the same server as HolidayOps, planned for February 2027.
Everything runs from `compose.prod.yaml`; only the web app (port 3000) and the API (port 5000)
are published, both on `127.0.0.1` for a reverse proxy in front.

## First deploy

1. Point a DNS `A` record for `marketclock.ahmershah.dev` at the server.
2. On the server, clone the repository and create `.env` from `.env.example` with strong
   values for `MYSQL_USER`, `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD`. Set
   `SITE_URL=https://marketclock.ahmershah.dev`. If HolidayOps already uses ports 3000 or
   5000, set `WEB_PORT` and `API_PORT` too.
3. Start the stack:

   ```bash
   docker compose -f compose.prod.yaml up -d --build
   ```

   The API container applies the Alembic migrations and loads the sourced seed rows on every
   start, then runs gunicorn. Both steps are idempotent.
4. Put the reverse proxy in front. With Caddy, which also gets the TLS certificate:

   ```caddy
   marketclock.ahmershah.dev {
       encode zstd gzip
       reverse_proxy 127.0.0.1:3000
   }
   ```

   With nginx, proxy `/` to `http://127.0.0.1:3000` with
   `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` and add a certificate with
   certbot. The web app proxies `/api/v1/*` to the API itself, so one upstream is enough.

   The API rate limit (`RATE_LIMIT_PER_MINUTE`, default 120 per client) keys on the last
   `X-Forwarded-For` entry, so the reverse proxy must set it. Caddy does by default.
5. Check:

   ```bash
   curl -fsS https://marketclock.ahmershah.dev/api/v1/health
   curl -fsS https://marketclock.ahmershah.dev/sitemap.xml | head
   ```

## Updates

```bash
git pull
docker compose -f compose.prod.yaml up -d --build
```

## After going live

- Submit `https://marketclock.ahmershah.dev/sitemap.xml` in Google Search Console and Bing
  Webmaster Tools.
- Run Lighthouse on `/`, `/markets` and a market page (target 90 or more) and add the scores to
  the README.
- Back up the `mysql-data` volume. Only the settlement cycles and official closures live there,
  and both can be rebuilt with `flask --app wsgi seed`.

## Releases

Semantic versions, tagged on `main`: `v0.x` until the live launch (pre-releases; the API may
still change between minor versions), `v1.0.0` at launch, and after that a breaking API change
needs a new major version and `/api/v2`.

1. In a PR, set the version in `backend/pyproject.toml` and `frontend/package.json`.
2. After the merge, tag the merge commit and publish the release; the notes list the merged pull
   requests since the previous tag:

```bash
git checkout main && git pull
git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z
gh release create vX.Y.Z --verify-tag --title "vX.Y.Z" --generate-notes   # add --prerelease before 1.0
```

## Images

The `images` workflow builds both production images on every pull request and pushes them to
GitHub Container Registry on `main` (tags: commit SHA and `latest`) and on release tags (tag: the
version without the `v`):

```bash
docker pull ghcr.io/ahmershahdev/marketclock-api:latest
docker pull ghcr.io/ahmershahdev/marketclock-web:latest
```

The web image is built with `API_URL=http://api:5000`, the API's name in `compose.prod.yaml`.
`compose.prod.yaml` still builds from source; the published images are for pulling a known build.

## Wiki

The GitHub wiki is a short user guide that links back to `docs/`; the repository wins when they
disagree. Only collaborators can edit it. Edit it by cloning
`https://github.com/ahmershahdev/marketclock.wiki.git` (pages are `Page-Name.md`, plus
`_Sidebar.md` and `_Footer.md`). When a change alters something a page describes (setup,
environment variables, endpoints, error codes, data on file), update the page too.
