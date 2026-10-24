from collections.abc import Iterator
from pathlib import Path

import pytest
from dotenv import load_dotenv
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy.orm import Session

from app import create_app
from app.cache import MemoryCache
from app.config import Config
from app.db import Base, make_engine
from app.seed import seed_settlement_cycles

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@pytest.fixture
def config() -> Config:
    return Config.from_env("test")


@pytest.fixture(scope="session", autouse=True)
def tables() -> Iterator[None]:
    engine = make_engine(Config.from_env("test").database_url)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        seed_settlement_cycles(session)
    yield
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def cache() -> MemoryCache:
    return MemoryCache()


@pytest.fixture
def app(config: Config, cache: MemoryCache) -> Iterator[Flask]:
    app = create_app(config, cache=cache)
    yield app
    app.extensions["engine"].dispose()


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()
