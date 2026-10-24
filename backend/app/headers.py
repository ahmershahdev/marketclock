from flask import Flask, Response, request

REFERENCE_MAX_AGE = 300
LIVE_PATHS = ("/api/v1/status", "/api/v1/health")


def cache_policy(path: str, status: int) -> str:
    if status >= 400 or path.startswith(LIVE_PATHS) or path.endswith("/status"):
        return "no-store"
    return f"public, max-age={REFERENCE_MAX_AGE}, stale-while-revalidate={REFERENCE_MAX_AGE * 2}"


def register_headers(app: Flask) -> None:
    @app.after_request
    def add_headers(response: Response) -> Response:
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        # The API only serves data, never pages, so nothing in a response may load or run.
        response.headers.setdefault(
            "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
        )
        if request.path.startswith("/api/v1/") and "Cache-Control" not in response.headers:
            response.headers["Cache-Control"] = cache_policy(request.path, response.status_code)
        return response
