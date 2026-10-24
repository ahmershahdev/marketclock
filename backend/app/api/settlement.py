from flask import Blueprint, Response

from app.api.markets import json_response, parse_query
from app.core import settlement
from app.schemas import OverlapQuery, OverlapResponse, SettlementQuery, SettlementResponse

bp = Blueprint("settlement", __name__)


@bp.get("/settlement")
def settlement_date() -> Response:
    query = parse_query(SettlementQuery)
    found = settlement.settlement_date(query.markets, query.trade_date, query.cycle)
    return json_response(
        SettlementResponse(
            markets=query.markets,
            trade_date=found.trade_date,
            cycle=query.cycle,
            trade_date_is_trading_day=found.trade_date_is_trading_day,
            settlement_date=found.settlement_date,
        )
    )


@bp.get("/overlap")
def overlap() -> Response:
    query = parse_query(OverlapQuery)
    days = settlement.overlap(query.markets, query.start, query.end)
    return json_response(
        OverlapResponse(
            markets=query.markets,
            start=query.start,
            end=query.end,
            count=len(days),
            days=days,
        )
    )
