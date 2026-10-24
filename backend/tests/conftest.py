from collections.abc import Iterator
from pathlib import Path

import pytest
from dotenv import load_dotenv
from flask import Flask
from flask.testing import FlaskClient

from app import create_app
from app.cache import MemoryCache
from app.config import Config

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@pytest.fixture
def config() -> Config:
    return Config.from_env("test")


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
