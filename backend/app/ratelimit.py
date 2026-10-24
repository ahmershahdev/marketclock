import ipaddress
from time import time as now

from flask import Flask, Response, g, request
from redis import RedisError

from app.cache import get_cache
from app.errors import error_response

WINDOW_SECONDS = 60


def client_key() -> str | None:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        # The last entry is the one our reverse proxy added; earlier ones can be forged.
        return forwarded.split(",")[-1].strip()
    address = request.remote_addr or ""
    try:
        ip = ipaddress.ip_address(address)
    except ValueError:
        return address or None
    # The web app's own server-side calls carry no forwarded header and share one address.
    return None if ip.is_private or ip.is_loopback else address


def register_rate_limit(app: Flask, limit: int) -> None:
    if limit <= 0:
        return

    @app.before_request
    def check() -> tuple[Response, int] | None:
        if not request.path.startswith("/api/v1/") or request.path == "/api/v1/health":
            return None
        client = client_key()
        if client is None:
            return None
        moment = now()
        window = int(moment // WINDOW_SECONDS)
        try:
            count = get_cache().incr(f"ratelimit:{client}:{window}", WINDOW_SECONDS)
        except RedisError:
            return None
        g.rate_remaining = max(limit - count, 0)
        if count <= limit:
            return None
        retry_after = int((window + 1) * WINDOW_SECONDS - moment) + 1
        response, status = error_response(
            429,
            "rate_limited",
            f"At most {limit} requests a minute; try again in {retry_after} seconds",
            {"limit": limit, "retry_after": retry_after},
        )
        response.headers["Retry-After"] = str(retry_after)
        return response, status

    @app.after_request
    def headers(response: Response) -> Response:
        if "rate_remaining" in g:
            response.headers["RateLimit-Limit"] = str(limit)
            response.headers["RateLimit-Remaining"] = str(g.rate_remaining)
        return response
