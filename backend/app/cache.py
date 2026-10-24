import time
from collections.abc import Callable
from contextlib import suppress
from typing import Protocol

from flask import current_app
from redis import Redis, RedisError


class Cache(Protocol):
    def get(self, key: str) -> str | None: ...

    def set(self, key: str, value: str, ttl_seconds: int) -> None: ...

    def incr(self, key: str, ttl_seconds: int) -> int: ...

    def ping(self) -> bool: ...


class RedisCache:
    def __init__(self, client: Redis) -> None:
        self._client = client

    @classmethod
    def from_url(cls, url: str) -> "RedisCache":
        return cls(Redis.from_url(url, decode_responses=True, socket_timeout=2))

    def get(self, key: str) -> str | None:
        value = self._client.get(key)
        # Typed as bytes | str, but decode_responses=True always returns str.
        return value.decode() if isinstance(value, bytes) else value

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        self._client.set(key, value, ex=ttl_seconds)

    def incr(self, key: str, ttl_seconds: int) -> int:
        pipeline = self._client.pipeline()
        pipeline.incr(key)
        pipeline.expire(key, ttl_seconds, nx=True)
        count, _ = pipeline.execute()
        return int(count)

    def ping(self) -> bool:
        try:
            return bool(self._client.ping())
        except RedisError:
            return False


class MemoryCache:
    def __init__(self, clock: Callable[[], float] = time.monotonic) -> None:
        self._clock = clock
        self._items: dict[str, tuple[str, float]] = {}
        self.available = True

    def get(self, key: str) -> str | None:
        if not self.available:
            raise RedisError("cache is down")
        item = self._items.get(key)
        if item is None:
            return None
        value, expires_at = item
        if self._clock() >= expires_at:
            del self._items[key]
            return None
        return value

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        if not self.available:
            raise RedisError("cache is down")
        self._items[key] = (value, self._clock() + ttl_seconds)

    def incr(self, key: str, ttl_seconds: int) -> int:
        current = self.get(key)
        count = int(current or 0) + 1
        expires_at = self._items[key][1] if current is not None else self._clock() + ttl_seconds
        self._items[key] = (str(count), expires_at)
        return count

    def ping(self) -> bool:
        return self.available


def cached(
    cache: Cache, key: str, ttl_seconds: int, compute: Callable[[], str]
) -> tuple[str, bool]:
    # A cache outage must not fail the request, so Redis errors fall back to computing.
    try:
        hit = cache.get(key)
    except RedisError:
        return compute(), False
    if hit is not None:
        return hit, True
    value = compute()
    with suppress(RedisError):
        cache.set(key, value, ttl_seconds)
    return value, False


def get_cache() -> Cache:
    cache: Cache = current_app.extensions["cache"]
    return cache
