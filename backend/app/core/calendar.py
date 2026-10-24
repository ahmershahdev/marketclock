from dataclasses import dataclass
from datetime import date, timedelta
from functools import cache
from typing import Literal

import holidays
from holidays import HolidayBase
from holidays.constants import HALF_DAY, PUBLIC

MAX_RANGE_DAYS = 400

Category = Literal["public", "half_day"]


class UnknownMarketError(ValueError):
    def __init__(self, code: str) -> None:
        super().__init__(f"Unknown market {code!r}")
        self.code = code


class YearOutOfRangeError(ValueError):
    def __init__(self, code: str, year: int, first: int, last: int) -> None:
        super().__init__(f"{code} has data for {first} to {last}, not {year}")
        self.year, self.first, self.last = year, first, last


class InvalidRangeError(ValueError):
    pass


@dataclass(frozen=True)
class Holiday:
    date: date
    name: str
    category: Category


@cache
def market_codes() -> frozenset[str]:
    # list_supported_financial() also returns aliases such as NYSE; .market is always the MIC.
    return frozenset(
        holidays.financial_holidays(code).market for code in holidays.list_supported_financial()
    )


def market_calendar(
    code: str, categories: tuple[str, ...] = (PUBLIC,), year: int | None = None
) -> HolidayBase:
    if code not in market_codes():
        raise UnknownMarketError(code)
    market = holidays.financial_holidays(code)
    language = "en_US" if "en_US" in market.supported_languages else None
    return holidays.financial_holidays(code, years=year, categories=categories, language=language)


def check_year(calendar: HolidayBase, year: int) -> None:
    if not calendar.start_year <= year <= calendar.end_year:
        raise YearOutOfRangeError(calendar.market, year, calendar.start_year, calendar.end_year)


def market_holidays(code: str, year: int) -> list[Holiday]:
    closures = market_calendar(code, year=year)
    check_year(closures, year)
    found = [Holiday(day, name, "public") for day, name in closures.items()]
    if HALF_DAY in closures.supported_categories:
        half_days = market_calendar(code, (HALF_DAY,), year)
        found += [Holiday(day, name, "half_day") for day, name in half_days.items()]
    return sorted(found, key=lambda holiday: holiday.date)


def is_trading_day(code: str, day: date) -> bool:
    calendar = market_calendar(code)
    check_year(calendar, day.year)
    return calendar.is_working_day(day)


def next_trading_day(code: str, day: date) -> date:
    return _adjacent_trading_day(code, day, 1)


def previous_trading_day(code: str, day: date) -> date:
    return _adjacent_trading_day(code, day, -1)


def _adjacent_trading_day(code: str, day: date, step: int) -> date:
    calendar = market_calendar(code)
    check_year(calendar, day.year)
    found = calendar.get_nth_working_day(day, step)
    check_year(calendar, found.year)
    return found


def trading_days(code: str, start: date, end: date) -> list[date]:
    if start > end:
        raise InvalidRangeError("start must not be after end")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise InvalidRangeError(f"a range covers at most {MAX_RANGE_DAYS} days")
    calendar = market_calendar(code)
    check_year(calendar, start.year)
    check_year(calendar, end.year)
    days = (start + timedelta(days=offset) for offset in range((end - start).days + 1))
    return [day for day in days if calendar.is_working_day(day)]
