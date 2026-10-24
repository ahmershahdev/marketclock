import os
from dataclasses import dataclass
from typing import Literal

from sqlalchemy.engine import make_url

Env = Literal["dev", "test", "prod"]
ENVS: tuple[Env, ...] = ("dev", "test", "prod")


@dataclass(frozen=True)
class Config:
    env: Env
    database_url: str
    redis_url: str | None
    rate_limit: int = 0

    @property
    def testing(self) -> bool:
        return self.env == "test"

    @classmethod
    def from_env(cls, env: str | None = None) -> "Config":
        name = env or os.environ.get("MARKETCLOCK_ENV", "dev")
        if name not in ENVS:
            raise ValueError(f"MARKETCLOCK_ENV must be one of {', '.join(ENVS)}, not {name!r}")

        database_var = "TEST_DATABASE_URL" if name == "test" else "DATABASE_URL"
        database_url = os.environ.get(database_var)
        if not database_url:
            raise RuntimeError(f"{database_var} is not set")
        # Tests create and drop tables, so they must never point at a real database.
        if name == "test" and not (make_url(database_url).database or "").endswith("_test"):
            raise RuntimeError("TEST_DATABASE_URL must name a database ending in _test")

        redis_url = os.environ.get("REDIS_URL")
        if not redis_url and name != "test":
            raise RuntimeError("REDIS_URL is not set")

        # Tests load .env too, so the limit stays off there whatever it says.
        rate_limit = 0 if name == "test" else int(os.environ.get("RATE_LIMIT_PER_MINUTE", "120"))

        return cls(env=name, database_url=database_url, redis_url=redis_url, rate_limit=rate_limit)
