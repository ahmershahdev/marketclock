import csv
import io
from datetime import UTC, date, datetime
from importlib.metadata import version

from flask import Blueprint, Response, current_app, request
from pydantic import BaseModel

from app.cache import cached, get_cache
from app.core import calendar, markets
from app.core.ics import calendar_ics
from app.schemas import (
    AdjacentTradingDayResponse,
    DateQuery,
    Holiday,
    HolidaysResponse,
    Market,
    MarketList,
    OptionalYearQuery,
    Query,
    RangeQuery,
    TradingDayResponse,
    TradingDaysResponse,
    YearQuery,
)

bp = Blueprint("markets", __name__, url_prefix="/markets")

HOLIDAYS_TTL = 7 * 24 * 3600
# Bump when cached holiday JSON changes for reasons other than a library upgrade.
HOLIDAYS_CACHE_VERSION = 4


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
    session = markets.SESSIONS.get(code)
    early_close = session.early_close if session else None
    body = HolidaysResponse(
        market=code,
        year=year,
        holidays=[
            Holiday(
                date=h.date,
                name=h.name,
                category=h.category,
                half_day=h.category == "half_day",
                close_time=early_close if h.category == "half_day" else None,
            )
            for h in found
        ],
    )
    return body.model_dump_json()


@bp.get("/<code>/holidays")
def holidays(code: str) -> Response:
    query = parse_query(YearQuery)
    key = f"holidays:v{HOLIDAYS_CACHE_VERSION}:{version('holidays')}:{code}:{query.year}"
    body, hit = cached(get_cache(), key, HOLIDAYS_TTL, lambda: holidays_json(code, query.year))
    response = current_app.response_class(body, mimetype="application/json")
    response.headers["X-Cache"] = "hit" if hit else "miss"
    return response


@bp.get("/<code>/holidays.csv")
def holidays_csv(code: str) -> Response:
    query = parse_query(YearQuery)
    found = calendar.market_holidays(code, query.year)
    session = markets.SESSIONS.get(code)
    early_close = session.early_close if session else ""
    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow(["date", "name", "category", "half_day", "close_time"])
    for h in found:
        half = h.category == "half_day"
        writer.writerow(
            [h.date.isoformat(), h.name, h.category, str(half).lower(), early_close if half else ""]
        )
    response = current_app.response_class(out.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = (
        f'attachment; filename="{code}-holidays-{query.year}.csv"'
    )
    return response


@bp.get("/<code>/calendar.ics")
def calendar_feed(code: str) -> Response:
    query = parse_query(OptionalYearQuery)
    market = markets.get_market(code)
    # Without a year this is a subscription feed, so it rolls over to cover this year and next.
    this_year = date.today().year
    years = [query.year] if query.year is not None else [this_year, this_year + 1]
    years = [y for y in years if market.first_year <= y <= market.last_year] or years
    found = [h for year in years for h in calendar.market_holidays(code, year)]
    early_close = market.session.early_close if market.session else None
    body = calendar_ics(code, market.name, found, early_close, datetime.now(UTC))
    response = current_app.response_class(body, mimetype="text/calendar")
    response.headers["Content-Disposition"] = f'inline; filename="{code}-holidays.ics"'
    response.headers["Cache-Control"] = "public, max-age=3600"
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
