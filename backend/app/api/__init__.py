from flask import Blueprint, Response, jsonify

from app.api.health import bp as health_bp
from app.api.markets import bp as markets_bp
from app.api.settlement import bp as settlement_bp
from app.openapi import build

api = Blueprint("api", __name__, url_prefix="/api/v1")
api.register_blueprint(health_bp)
api.register_blueprint(markets_bp)
api.register_blueprint(settlement_bp)


@api.get("/openapi.json")
def openapi() -> Response:
    return jsonify(build())
