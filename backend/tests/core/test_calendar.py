from datetime import date

import pytest

from app.core.calendar import (
    InvalidRangeError,
    UnknownMarketError,
    YearOutOfRangeError,
    is_trading_day,
    market_codes,
    market_holidays,
    next_trading_day,
    previous_trading_day,
    trading_days,
)


def test_market_codes_are_mics_without_aliases() -> None:
    codes = market_codes()

    assert {"XNYS", "XKAR", "XSAU", "XLON"} <= codes
    assert "NYSE" not in codes


@pytest.mark.parametrize("code", ["NYSE", "xnys", "NOPE", ""])
def test_unknown_market_codes_are_rejected(code: str) -> None:
    with pytest.raises(UnknownMarketError):
        is_trading_day(code, date(2026, 1, 2))


def test_holidays_include_half_days_in_date_order() -> None:
    found = market_holidays("XNYS", 2026)

    assert [h.date for h in found] == sorted(h.date for h in found)
    by_date = {h.date: h for h in found}
    assert by_date[date(2026, 7, 3)].category == "public"
    assert by_date[date(2026, 11, 27)].category == "half_day"
    assert by_date[date(2026, 12, 24)].category == "half_day"


def test_markets_without_half_days_list_closures_only() -> None:
    found = market_holidays("XKAR", 2026)

    assert found
    assert {h.category for h in found} == {"public"}


def test_holiday_names_are_english_when_the_library_has_them() -> None:
    names = [h.name for h in market_holidays("XSAU", 2026)]

    assert "Founding Day Holiday" in names


@pytest.mark.parametrize("year", [1999, 2101])
def test_years_outside_the_library_data_are_rejected(year: int) -> None:
    with pytest.raises(YearOutOfRangeError) as error:
        market_holidays("XLON", year)

    assert (error.value.first, error.value.last) == (2000, 2100)


@pytest.mark.parametrize(
    ("day", "expected"),
    [
        (date(2026, 7, 2), True),
        (date(2026, 7, 3), False),
        (date(2026, 7, 4), False),
        (date(2026, 11, 27), True),
    ],
)
def test_is_trading_day(day: date, expected: bool) -> None:
    assert is_trading_day("XNYS", day) is expected


def test_weekend_comes_from_the_market() -> None:
    assert is_trading_day("XSAU", date(2026, 1, 4)) is True
    assert is_trading_day("XSAU", date(2026, 1, 2)) is False


def test_next_and_previous_trading_day_skip_closures_and_weekends() -> None:
    assert next_trading_day("XNYS", date(2026, 7, 2)) == date(2026, 7, 6)
    assert previous_trading_day("XNYS", date(2026, 7, 6)) == date(2026, 7, 2)


def test_next_trading_day_crosses_the_year_boundary() -> None:
    assert next_trading_day("XNYS", date(2026, 12, 31)) == date(2027, 1, 4)
    assert previous_trading_day("XNYS", date(2027, 1, 4)) == date(2026, 12, 31)


def test_adjacent_trading_day_stays_inside_the_library_data() -> None:
    with pytest.raises(YearOutOfRangeError):
        next_trading_day("XNYS", date(2100, 12, 31))
    with pytest.raises(YearOutOfRangeError):
        previous_trading_day("XNYS", date(1863, 1, 1))


def test_trading_days_include_both_ends() -> None:
    days = trading_days("XNYS", date(2026, 7, 2), date(2026, 7, 6))

    assert days == [date(2026, 7, 2), date(2026, 7, 6)]


def test_trading_days_of_a_full_year() -> None:
    assert len(trading_days("XNYS", date(2026, 1, 1), date(2026, 12, 31))) == 251


def test_trading_days_check_both_years() -> None:
    with pytest.raises(YearOutOfRangeError):
        trading_days("XLON", date(1999, 12, 1), date(2000, 1, 31))
    with pytest.raises(YearOutOfRangeError):
        trading_days("XLON", date(2100, 12, 1), date(2101, 1, 31))


@pytest.mark.parametrize(
    ("start", "end"),
    [(date(2026, 2, 1), date(2026, 1, 1)), (date(2026, 1, 1), date(2027, 2, 5))],
)
def test_trading_days_reject_bad_ranges(start: date, end: date) -> None:
    with pytest.raises(InvalidRangeError):
        trading_days("XNYS", start, end)


def test_a_range_of_exactly_the_cap_is_allowed() -> None:
    assert trading_days("XNYS", date(2026, 1, 1), date(2027, 2, 4))
