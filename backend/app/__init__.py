from flask import Flask
from sqlalchemy.orm import Session

from app.api import api
from app.cache import Cache, MemoryCache, RedisCache
from app.config import Config
from app.db import make_engine
from app.errors import register_error_handlers
from app.seed import seed_settlement_cycles


def create_app(config: Config | None = None, cache: Cache | None = None) -> Flask:
    config = config or Config.from_env()

    app = Flask(__name__)
    app.config.update(ENV_NAME=config.env, TESTING=config.testing)

    app.extensions["engine"] = make_engine(config.database_url)
    if cache is None:
        cache = RedisCache.from_url(config.redis_url) if config.redis_url else MemoryCache()
    app.extensions["cache"] = cache

    @app.cli.command("seed")
    def seed() -> None:
        with Session(app.extensions["engine"]) as session:
            count = seed_settlement_cycles(session)
        print(f"Seeded {count} settlement cycles")

    register_error_handlers(app)
    app.register_blueprint(api)
    return app
