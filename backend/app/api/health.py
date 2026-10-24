from importlib.metadata import version

from flask import Blueprint, Response, jsonify

from app.cache import get_cache
from app.db import database_ok, get_engine

bp = Blueprint("health", __name__)


@bp.get("/health")
def health() -> tuple[Response, int]:
    checks = {"database": database_ok(get_engine()), "cache": get_cache().ping()}
    healthy = all(checks.values())
    body = {
        "status": "ok" if healthy else "degraded",
        "checks": {name: "ok" if ok else "down" for name, ok in checks.items()},
        "holidays_version": version("holidays"),
    }
    return jsonify(body), 200 if healthy else 503
