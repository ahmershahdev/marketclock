from datetime import UTC, datetime

from flask import Blueprint, Response

from app.api.markets import json_response, parse_query
from app.core.calendar import YearOutOfRangeError, market_codes
from app.core.status import market_status
from app.schemas import MarketStatusList, MarketStatusResponse, StatusQuery

bp = Blueprint("status", __name__)


def status_model(code: str, now: datetime) -> MarketStatusResponse:
    found = market_status(code, now)
    return MarketStatusResponse(
        market=code,
        state=found.state,
        detail=found.detail,
        local_time=found.local_time,
        closes_at=found.closes_at,
        opens_at=found.opens_at,
    )


@bp.get("/markets/<code>/status")
def one(code: str) -> Response:
    query = parse_query(StatusQuery)
    return json_response(status_model(code, query.at or datetime.now(UTC)))


@bp.get("/status")
def every() -> Response:
    query = parse_query(StatusQuery)
    now = query.at or datetime.now(UTC)
    found = []
    for code in sorted(market_codes()):
        # A market whose data does not cover this moment is left out rather than guessed.
        try:
            found.append(status_model(code, now))
        except YearOutOfRangeError:
            continue
    return json_response(MarketStatusList(found))
