from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, timedelta

from holidays import HolidayBase

from app.core.calendar import MAX_RANGE_DAYS, InvalidRangeError, check_year, market_calendar

MAX_MARKETS = 10
MAX_CYCLE = 10
MAX_SHIFT = 400


class InvalidMarketsError(ValueError):
    pass


class NoDefaultCycleError(ValueError):
    def __init__(self, markets: list[str]) -> None:
        super().__init__(f"No known settlement cycle for {', '.join(markets)}; choose a cycle")
        self.markets = markets


@dataclass(frozen=True)
class Cycle:
    days: int
    effective_from: date
    source_url: str


def cycle_on(cycles: Sequence[Cycle], day: date) -> Cycle | None:
    in_force = [cycle for cycle in cycles if cycle.effective_from <= day]
    return max(in_force, key=lambda cycle: cycle.effective_from, default=None)


def default_cycles(
    codes: Sequence[str], cycles: dict[str, list[Cycle]], day: date
) -> dict[str, Cycle]:
    found = {code: cycle_on(cycles.get(code, []), day) for code in codes}
    missing = [code for code, cycle in found.items() if cycle is None]
    if missing:
        raise NoDefaultCycleError(missing)
    return {code: cycle for code, cycle in found.items() if cycle is not None}


@dataclass(frozen=True)
class Settlement:
    trade_date: date
    trade_date_is_trading_day: bool
    settlement_date: date


def _calendars(codes: Sequence[str]) -> list[HolidayBase]:
    if not codes:
        raise InvalidMarketsError("name at least one market")
    if len(codes) > MAX_MARKETS:
        raise InvalidMarketsError(f"name at most {MAX_MARKETS} markets")
    if len(set(codes)) != len(codes):
        raise InvalidMarketsError("each market may appear only once")
    return [market_calendar(code) for code in codes]


def _open_on_all(calendars: list[HolidayBase], day: date) -> bool:
    for calendar in calendars:
        check_year(calendar, day.year)
    return all(calendar.is_working_day(day) for calendar in calendars)


def settlement_date(codes: Sequence[str], trade_date: date, cycle: int) -> Settlement:
    if not 0 <= cycle <= MAX_CYCLE:
        raise ValueError(f"cycle must be from 0 to {MAX_CYCLE}")
    calendars = _calendars(codes)
    trading = _open_on_all(calendars, trade_date)
    if cycle == 0 and trading:
        return Settlement(trade_date, trading, trade_date)
    day, counted = trade_date, 0
    while counted < max(cycle, 1):
        day += timedelta(days=1)
        counted += _open_on_all(calendars, day)
    return Settlement(trade_date, trading, day)


def add_trading_days(codes: Sequence[str], day: date, days: int) -> date:
    if days == 0 or abs(days) > MAX_SHIFT:
        raise InvalidRangeError(f"days must be from -{MAX_SHIFT} to {MAX_SHIFT}, not 0")
    calendars = _calendars(codes)
    step = timedelta(days=1 if days > 0 else -1)
    counted = 0
    while counted < abs(days):
        day += step
        counted += _open_on_all(calendars, day)
    return day


def overlap(codes: Sequence[str], start: date, end: date) -> list[date]:
    if start > end:
        raise InvalidRangeError("start must not be after end")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise InvalidRangeError(f"a range covers at most {MAX_RANGE_DAYS} days")
    calendars = _calendars(codes)
    days = (start + timedelta(days=offset) for offset in range((end - start).days + 1))
    return [day for day in days if _open_on_all(calendars, day)]
