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

   With nginx, proxy `/` to `http://127.0.0.1:3000` and add a certificate with certbot. The web
   app proxies `/api/v1/*` to the API itself, so one upstream is enough.
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
