from flask import Blueprint

from app.api.health import bp as health_bp

api = Blueprint("api", __name__, url_prefix="/api/v1")
api.register_blueprint(health_bp)
