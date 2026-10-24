import pytest
from flask.testing import FlaskClient

from app import create_app
from app.cache import MemoryCache
from app.config import Config


def test_health_is_ok_when_database_and_cache_answer(client: FlaskClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "ok"
    assert body["checks"] == {"database": "ok", "cache": "ok"}
    assert body["holidays_version"]


def test_health_degrades_when_the_cache_is_down(client: FlaskClient, cache: MemoryCache) -> None:
    cache.available = False

    response = client.get("/api/v1/health")

    assert response.status_code == 503
    assert response.get_json()["checks"]["cache"] == "down"


def test_health_degrades_when_the_database_is_down(cache: MemoryCache) -> None:
    unreachable = Config(
        env="test", database_url="mysql+pymysql://u:p@127.0.0.1:1/x_test", redis_url=None
    )
    client = create_app(unreachable, cache=cache).test_client()

    response = client.get("/api/v1/health")

    assert response.status_code == 503
    assert response.get_json()["checks"]["database"] == "down"


@pytest.mark.parametrize("redis_url", [None, "redis://127.0.0.1:1/0"])
def test_app_picks_a_cache_from_config(config: Config, redis_url: str | None) -> None:
    app = create_app(Config(env="test", database_url=config.database_url, redis_url=redis_url))
    assert app.extensions["cache"] is not None
