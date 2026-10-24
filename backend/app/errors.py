from typing import Any

from flask import Flask, Response, jsonify
from werkzeug.exceptions import HTTPException, InternalServerError


def error_response(
    status: int, code: str, message: str, params: dict[str, Any] | None = None
) -> tuple[Response, int]:
    body = {"error": {"code": code, "message": message, "params": params or {}}}
    return jsonify(body), status


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(HTTPException)
    def http_error(error: HTTPException) -> tuple[Response, int]:
        status = error.code or 500
        code = (error.name or "error").lower().replace(" ", "_")
        return error_response(status, code, error.description or code)

    @app.errorhandler(Exception)
    def unexpected_error(error: Exception) -> tuple[Response, int]:
        app.logger.exception("Unhandled error", exc_info=error)
        return error_response(500, "internal_server_error", InternalServerError.description)
