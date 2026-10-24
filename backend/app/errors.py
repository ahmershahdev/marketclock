from typing import Any

from flask import Flask, Response, jsonify
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException, InternalServerError

from app.core.calendar import (
    MAX_RANGE_DAYS,
    InvalidRangeError,
    UnknownMarketError,
    YearOutOfRangeError,
)


def error_response(
    status: int, code: str, message: str, params: dict[str, Any] | None = None
) -> tuple[Response, int]:
    body = {"error": {"code": code, "message": message, "params": params or {}}}
    return jsonify(body), status


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ValidationError)
    def invalid_query(error: ValidationError) -> tuple[Response, int]:
        fields = {".".join(map(str, e["loc"])): e["msg"] for e in error.errors()}
        message = f"Invalid query parameters: {', '.join(fields)}"
        return error_response(400, "invalid_parameter", message, {"fields": fields})

    @app.errorhandler(UnknownMarketError)
    def unknown_market(error: UnknownMarketError) -> tuple[Response, int]:
        return error_response(404, "unknown_market", str(error), {"market": error.code})

    @app.errorhandler(YearOutOfRangeError)
    def year_out_of_range(error: YearOutOfRangeError) -> tuple[Response, int]:
        params = {"year": error.year, "first": error.first, "last": error.last}
        return error_response(400, "year_out_of_range", str(error), params)

    @app.errorhandler(InvalidRangeError)
    def invalid_range(error: InvalidRangeError) -> tuple[Response, int]:
        return error_response(400, "invalid_range", str(error), {"max_days": MAX_RANGE_DAYS})

    @app.errorhandler(HTTPException)
    def http_error(error: HTTPException) -> tuple[Response, int]:
        status = error.code or 500
        code = (error.name or "error").lower().replace(" ", "_")
        return error_response(status, code, error.description or code)

    @app.errorhandler(Exception)
    def unexpected_error(error: Exception) -> tuple[Response, int]:
        app.logger.exception("Unhandled error", exc_info=error)
        return error_response(500, "internal_server_error", InternalServerError.description)
