from flask import Blueprint, Response, current_app, request
from pydantic import BaseModel

from app.core import calendar
from app.schemas import (
    AdjacentTradingDayResponse,
    DateQuery,
    Holiday,
    HolidaysResponse,
    RangeQuery,
    TradingDayResponse,
    TradingDaysResponse,
    YearQuery,
)

bp = Blueprint("markets", __name__, url_prefix="/markets")


def parse_query[Q: BaseModel](model: type[Q]) -> Q:
    return model.model_validate_strings(request.args.to_dict(), strict=True)


def json_response(body: BaseModel) -> Response:
    return current_app.response_class(body.model_dump_json(), mimetype="application/json")


@bp.get("/<code>/holidays")
def holidays(code: str) -> Response:
    query = parse_query(YearQuery)
    found = calendar.market_holidays(code, query.year)
    return json_response(
        HolidaysResponse(
            market=code,
            year=query.year,
            holidays=[
                Holiday(
                    date=h.date,
                    name=h.name,
                    category=h.category,
                    half_day=h.category == "half_day",
                )
                for h in found
            ],
        )
    )


@bp.get("/<code>/is-trading-day")
def is_trading_day(code: str) -> Response:
    query = parse_query(DateQuery)
    open_ = calendar.is_trading_day(code, query.date)
    return json_response(TradingDayResponse(market=code, date=query.date, is_trading_day=open_))


@bp.get("/<code>/next-trading-day")
def next_trading_day(code: str) -> Response:
    query = parse_query(DateQuery)
    found = calendar.next_trading_day(code, query.date)
    body = AdjacentTradingDayResponse(market=code, date=query.date, trading_day=found)
    return json_response(body)


@bp.get("/<code>/previous-trading-day")
def previous_trading_day(code: str) -> Response:
    query = parse_query(DateQuery)
    found = calendar.previous_trading_day(code, query.date)
    body = AdjacentTradingDayResponse(market=code, date=query.date, trading_day=found)
    return json_response(body)


@bp.get("/<code>/trading-days")
def trading_days(code: str) -> Response:
    query = parse_query(RangeQuery)
    days = calendar.trading_days(code, query.start, query.end)
    return json_response(
        TradingDaysResponse(
            market=code, start=query.start, end=query.end, count=len(days), days=days
        )
    )
