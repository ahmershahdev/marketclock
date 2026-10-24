from flask import Blueprint, Response

from app.api.markets import json_response, parse_query
from app.core import settlement
from app.core.calendar import UnknownMarketError, market_codes
from app.cycles import load_cycles
from app.db import get_engine
from app.schemas import (
    CycleSource,
    DateQuery,
    MarketCycleResponse,
    OverlapQuery,
    OverlapResponse,
    SettlementQuery,
    SettlementResponse,
)

bp = Blueprint("settlement", __name__)


def cycle_source(market: str, cycle: settlement.Cycle) -> CycleSource:
    return CycleSource(
        market=market,
        days=cycle.days,
        effective_from=cycle.effective_from,
        source_url=cycle.source_url,
    )


@bp.get("/markets/<code>/settlement-cycle")
def market_cycle(code: str) -> Response:
    query = parse_query(DateQuery)
    if code not in market_codes():
        raise UnknownMarketError(code)
    found = settlement.cycle_on(load_cycles(get_engine(), [code]).get(code, []), query.date)
    body = MarketCycleResponse(
        market=code, date=query.date, cycle=cycle_source(code, found) if found else None
    )
    return json_response(body)


@bp.get("/settlement")
def settlement_date() -> Response:
    query = parse_query(SettlementQuery)
    defaults: dict[str, settlement.Cycle] = {}
    cycle = query.cycle
    if cycle is None:
        for code in query.markets:
            if code not in market_codes():
                raise UnknownMarketError(code)
        cycles = load_cycles(get_engine(), query.markets)
        defaults = settlement.default_cycles(query.markets, cycles, query.trade_date)
        cycle = max(found.days for found in defaults.values())
    found = settlement.settlement_date(query.markets, query.trade_date, cycle)
    return json_response(
        SettlementResponse(
            markets=query.markets,
            trade_date=found.trade_date,
            cycle=cycle,
            cycle_from="query" if query.cycle is not None else "default",
            default_cycles=[cycle_source(code, c) for code, c in defaults.items()],
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
