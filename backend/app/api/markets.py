from importlib.metadata import version

from flask import Blueprint, Response, current_app, request
from pydantic import BaseModel

from app.cache import cached, get_cache
from app.core import calendar, markets
from app.schemas import (
    AdjacentTradingDayResponse,
    DateQuery,
    Holiday,
    HolidaysResponse,
    Market,
    MarketList,
    Query,
    RangeQuery,
    TradingDayResponse,
    TradingDaysResponse,
    YearQuery,
)

bp = Blueprint("markets", __name__, url_prefix="/markets")

HOLIDAYS_TTL = 7 * 24 * 3600


def parse_query[Q: BaseModel](model: type[Q]) -> Q:
    return model.model_validate_strings(request.args.to_dict(), strict=True)


def json_response(body: BaseModel) -> Response:
    return current_app.response_class(body.model_dump_json(), mimetype="application/json")


def market_model(market: markets.Market) -> Market:
    return Market.model_validate(market, from_attributes=True)


@bp.get("")
def list_markets() -> Response:
    parse_query(Query)
    return json_response(MarketList([market_model(m) for m in markets.list_markets()]))


@bp.get("/<code>")
def get_market(code: str) -> Response:
    parse_query(Query)
    return json_response(market_model(markets.get_market(code)))


def holidays_json(code: str, year: int) -> str:
    found = calendar.market_holidays(code, year)
    body = HolidaysResponse(
        market=code,
        year=year,
        holidays=[
            Holiday(
                date=h.date, name=h.name, category=h.category, half_day=h.category == "half_day"
            )
            for h in found
        ],
    )
    return body.model_dump_json()


@bp.get("/<code>/holidays")
def holidays(code: str) -> Response:
    query = parse_query(YearQuery)
    key = f"holidays:{version('holidays')}:{code}:{query.year}"
    body, hit = cached(get_cache(), key, HOLIDAYS_TTL, lambda: holidays_json(code, query.year))
    response = current_app.response_class(body, mimetype="application/json")
    response.headers["X-Cache"] = "hit" if hit else "miss"
    return response


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
