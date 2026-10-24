import pytest
from redis import RedisError

from app.cache import MemoryCache, RedisCache, cached


class Clock:
    def __init__(self) -> None:
        self.now = 0.0

    def __call__(self) -> float:
        return self.now


class StubRedis:
    def __init__(self, fail: bool = False) -> None:
        self.data: dict[str, str] = {}
        self.fail = fail

    def get(self, key: str) -> str | None:
        return self.data.get(key)

    def set(self, key: str, value: str, ex: int) -> None:
        self.data[key] = value

    def ping(self) -> bool:
        if self.fail:
            raise RedisError("down")
        return True


def test_memory_cache_expires_entries() -> None:
    clock = Clock()
    cache = MemoryCache(clock=clock)

    cache.set("k", "v", ttl_seconds=10)
    assert cache.get("k") == "v"

    clock.now = 10
    assert cache.get("k") is None
    assert cache.get("missing") is None


def test_memory_cache_can_simulate_an_outage() -> None:
    cache = MemoryCache()
    assert cache.ping()
    cache.available = False
    assert not cache.ping()


def test_redis_cache_round_trip() -> None:
    cache = RedisCache(StubRedis())  # type: ignore[arg-type]

    cache.set("k", "v", ttl_seconds=60)

    assert cache.get("k") == "v"
    assert cache.ping()


def test_redis_cache_reports_an_unreachable_server() -> None:
    assert not RedisCache(StubRedis(fail=True)).ping()  # type: ignore[arg-type]


def test_redis_cache_builds_from_a_url() -> None:
    assert isinstance(RedisCache.from_url("redis://localhost:6379/0"), RedisCache)


def test_memory_cache_simulates_an_outage() -> None:
    cache = MemoryCache()
    cache.available = False

    with pytest.raises(RedisError):
        cache.get("k")
    with pytest.raises(RedisError):
        cache.set("k", "v", 10)


def test_cached_computes_once() -> None:
    cache = MemoryCache()
    calls: list[int] = []

    def compute() -> str:
        calls.append(1)
        return "value"

    assert cached(cache, "k", 60, compute) == ("value", False)
    assert cached(cache, "k", 60, compute) == ("value", True)
    assert len(calls) == 1


def test_cached_computes_when_the_cache_is_down() -> None:
    cache = MemoryCache()
    cache.available = False

    assert cached(cache, "k", 60, lambda: "value") == ("value", False)


class WriteFails(MemoryCache):
    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        raise RedisError("read-only replica")


def test_cached_survives_a_failed_write() -> None:
    assert cached(WriteFails(), "k", 60, lambda: "value") == ("value", False)
