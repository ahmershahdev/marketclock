import pytest
from flask.testing import FlaskClient

from app.headers import cache_policy


@pytest.mark.parametrize(
    ("path", "status", "expected"),
    [
        ("/api/v1/markets", 200, "public, max-age=300, stale-while-revalidate=600"),
        ("/api/v1/markets/XNYS/holidays", 200, "public, max-age=300, stale-while-revalidate=600"),
        ("/api/v1/status", 200, "no-store"),
        ("/api/v1/markets/XNYS/status", 200, "no-store"),
        ("/api/v1/health", 200, "no-store"),
        ("/api/v1/markets/NOPE", 404, "no-store"),
    ],
)
def test_cache_policy(path: str, status: int, expected: str) -> None:
    assert cache_policy(path, status) == expected


def test_every_response_carries_security_headers(client: FlaskClient) -> None:
    response = client.get("/api/v1/markets")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["Referrer-Policy"] == "no-referrer"
    assert (
        response.headers["Content-Security-Policy"] == "default-src 'none'; frame-ancestors 'none'"
    )
    assert response.headers["Cache-Control"].startswith("public, max-age=300")


def test_live_and_error_responses_are_not_cached(client: FlaskClient) -> None:
    assert client.get("/api/v1/markets/XNYS/status").headers["Cache-Control"] == "no-store"
    assert (
        client.get("/api/v1/markets/NOPE/holidays?year=2026").headers["Cache-Control"] == "no-store"
    )


def test_a_route_can_set_its_own_cache_policy(client: FlaskClient) -> None:
    response = client.get("/api/v1/markets/XNYS/calendar.ics")

    assert response.headers["Cache-Control"] == "public, max-age=3600"


def test_paths_outside_the_api_get_no_cache_policy(client: FlaskClient) -> None:
    response = client.get("/nope")

    assert "Cache-Control" not in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
