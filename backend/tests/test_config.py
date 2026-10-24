import pytest

from app.config import Config

TEST_URL = "mysql+pymysql://u:p@localhost/marketclock_test"


@pytest.fixture(autouse=True)
def clean_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("MARKETCLOCK_ENV", "DATABASE_URL", "TEST_DATABASE_URL", "REDIS_URL"):
        monkeypatch.delenv(name, raising=False)


def test_dev_reads_database_and_redis(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "mysql+pymysql://u:p@localhost/marketclock")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")

    config = Config.from_env()

    assert config.env == "dev"
    assert not config.testing
    assert config.redis_url == "redis://localhost:6379/0"


def test_rate_limit_comes_from_the_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "mysql+pymysql://u:p@localhost/marketclock")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    monkeypatch.setenv("TEST_DATABASE_URL", "mysql+pymysql://u:p@localhost/marketclock_test")
    monkeypatch.delenv("RATE_LIMIT_PER_MINUTE", raising=False)
    assert Config.from_env("dev").rate_limit == 120

    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "30")
    assert Config.from_env("dev").rate_limit == 30
    assert Config.from_env("test").rate_limit == 0


def test_unknown_env_is_rejected() -> None:
    with pytest.raises(ValueError, match="MARKETCLOCK_ENV"):
        Config.from_env("staging")


def test_missing_database_url_is_rejected() -> None:
    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        Config.from_env("prod")


def test_missing_redis_url_is_rejected_outside_tests(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "mysql+pymysql://u:p@localhost/marketclock")
    with pytest.raises(RuntimeError, match="REDIS_URL"):
        Config.from_env("prod")


def test_test_env_needs_a_test_database(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TEST_DATABASE_URL", "mysql+pymysql://u:p@localhost/marketclock")
    with pytest.raises(RuntimeError, match="_test"):
        Config.from_env("test")


def test_test_env_runs_without_redis(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TEST_DATABASE_URL", TEST_URL)

    config = Config.from_env("test")

    assert config.testing
    assert config.redis_url is None
