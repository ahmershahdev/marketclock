from collections.abc import Iterator

import pytest
from flask import Flask
from flask.testing import FlaskClient

from app import create_app
from app.cache import MemoryCache
from app.config import Config

URL = "/api/v1/markets/XNYS/is-trading-day?date=2026-07-02"
CLIENT = {"X-Forwarded-For": "203.0.113.9, 8.8.8.8"}


@pytest.fixture
def limited(config: Config, cache: MemoryCache, monkeypatch: pytest.MonkeyPatch) -> Iterator[Flask]:
    monkeypatch.setattr("app.ratelimit.now", lambda: 1_000_010.0)
    app = create_app(
        Config(env="test", database_url=config.database_url, redis_url=None, rate_limit=2),
        cache=cache,
    )
    yield app
    app.extensions["engine"].dispose()


def test_requests_over_the_limit_get_429(limited: Flask) -> None:
    client = limited.test_client()

    first = client.get(URL, headers=CLIENT)
    client.get(URL, headers=CLIENT)
    third = client.get(URL, headers=CLIENT)

    assert first.headers["RateLimit-Limit"] == "2"
    assert first.headers["RateLimit-Remaining"] == "1"
    assert third.status_code == 429
    assert third.headers["Retry-After"] == "11"
    assert third.get_json()["error"]["code"] == "rate_limited"
    assert third.get_json()["error"]["params"] == {"limit": 2, "retry_after": 11}


def test_each_client_has_its_own_budget(limited: Flask) -> None:
    client = limited.test_client()
    for _ in range(3):
        client.get(URL, headers=CLIENT)

    assert client.get(URL, headers={"X-Forwarded-For": "198.51.100.4"}).status_code == 200


def test_public_address_without_a_proxy_is_limited(limited: Flask) -> None:
    client = limited.test_client()
    public = {"REMOTE_ADDR": "8.8.8.8"}
    for _ in range(2):
        client.get(URL, environ_base=public)

    assert client.get(URL, environ_base=public).status_code == 429


@pytest.mark.parametrize("address", ["127.0.0.1", "172.18.0.5", "not-an-ip", ""])
def test_internal_callers_are_not_limited(limited: Flask, address: str) -> None:
    client = limited.test_client()
    statuses = {
        client.get(URL, environ_base={"REMOTE_ADDR": address}).status_code for _ in range(4)
    }

    expected = {429, 200} if address == "not-an-ip" else {200}
    assert statuses == expected


def test_health_and_other_paths_are_not_limited(limited: Flask) -> None:
    client = limited.test_client()
    for _ in range(3):
        assert client.get("/api/v1/health", headers=CLIENT).status_code != 429
    assert client.get("/nope", headers=CLIENT).status_code == 404


def test_a_cache_outage_lets_requests_through(limited: Flask, cache: MemoryCache) -> None:
    cache.available = False
    client = limited.test_client()

    assert {client.get(URL, headers=CLIENT).status_code for _ in range(3)} == {200}


def test_limit_is_off_by_default_in_tests(client: FlaskClient) -> None:
    response = client.get(URL, headers=CLIENT)

    assert "RateLimit-Limit" not in response.headers


def test_a_forged_first_entry_does_not_reset_the_budget(limited: Flask) -> None:
    client = limited.test_client()
    for fake in ("1.1.1.1", "2.2.2.2"):
        client.get(URL, headers={"X-Forwarded-For": f"{fake}, 8.8.8.8"})

    third = client.get(URL, headers={"X-Forwarded-For": "3.3.3.3, 8.8.8.8"})
    assert third.status_code == 429
