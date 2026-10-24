from dataclasses import dataclass
from datetime import date, datetime, time
from typing import Literal
from zoneinfo import ZoneInfo

from app.core.calendar import is_trading_day, market_holidays, next_trading_day
from app.core.markets import get_market

State = Literal["open", "closed", "hours_unknown"]
Detail = Literal["regular", "early_close", "before_open", "after_close", "weekend", "holiday"]


@dataclass(frozen=True)
class MarketStatus:
    state: State
    detail: Detail
    local_time: datetime
    closes_at: datetime | None
    opens_at: datetime | None


def _at(day: date, hhmm: str, zone: ZoneInfo) -> datetime:
    return datetime.combine(day, time.fromisoformat(hhmm), zone)


def market_status(code: str, now: datetime) -> MarketStatus:
    market = get_market(code)
    zone = ZoneInfo(market.timezone)
    local = now.astimezone(zone)
    today = local.date()
    session = market.session
    opens = session.open if session else None
    close = session.close if session else None
    early_close = session.early_close if session else None

    def next_open() -> datetime | None:
        return _at(next_trading_day(code, today), opens, zone) if opens else None

    if not is_trading_day(code, today):
        detail: Detail = "weekend" if today.weekday() in market.weekend else "holiday"
        return MarketStatus("closed", detail, local, None, next_open())
    if opens is None or close is None:
        return MarketStatus("hours_unknown", "regular", local, None, None)

    half_day = any(
        h.date == today and h.category == "half_day" for h in market_holidays(code, today.year)
    )
    early = half_day and early_close is not None
    closing = _at(today, early_close if early and early_close else close, zone)
    opening = _at(today, opens, zone)
    if local < opening:
        return MarketStatus("closed", "before_open", local, None, opening)
    if local < closing:
        return MarketStatus("open", "early_close" if early else "regular", local, closing, None)
    return MarketStatus("closed", "after_close", local, None, next_open())
