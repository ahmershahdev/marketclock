from datetime import date

import pytest

from app.core.calendar import InvalidRangeError, UnknownMarketError, YearOutOfRangeError
from app.core.settlement import InvalidMarketsError, overlap, settlement_date


def test_t_plus_one_skips_a_closure() -> None:
    found = settlement_date(["XNYS"], date(2026, 7, 2), 1)

    assert found.settlement_date == date(2026, 7, 6)
    assert found.trade_date_is_trading_day is True


def test_two_markets_must_both_be_open() -> None:
    # 24 Dec is a half day on both, so it counts; 28 Dec is the LSE Boxing Day substitute.
    found = settlement_date(["XNYS", "XLON"], date(2026, 12, 23), 2)

    assert found.settlement_date == date(2026, 12, 29)


def test_t_plus_zero_on_a_trading_day_is_the_trade_date() -> None:
    assert settlement_date(["XNYS"], date(2026, 7, 2), 0).settlement_date == date(2026, 7, 2)


def test_t_plus_zero_on_a_closed_day_moves_to_the_next_trading_day() -> None:
    found = settlement_date(["XNYS"], date(2026, 7, 4), 0)

    assert found.settlement_date == date(2026, 7, 6)
    assert found.trade_date_is_trading_day is False


def test_settlement_crosses_the_year_boundary() -> None:
    assert settlement_date(["XNYS"], date(2026, 12, 31), 1).settlement_date == date(2027, 1, 4)


def test_markets_with_different_weekends() -> None:
    # Tadawul trades Sunday to Thursday, NYSE Monday to Friday.
    assert settlement_date(["XSAU", "XNYS"], date(2026, 1, 8), 1).settlement_date == date(
        2026, 1, 12
    )


@pytest.mark.parametrize("cycle", [-1, 11])
def test_cycle_is_bounded(cycle: int) -> None:
    with pytest.raises(ValueError, match="cycle"):
        settlement_date(["XNYS"], date(2026, 7, 2), cycle)


@pytest.mark.parametrize("codes", [[], ["XNYS", "XNYS"], ["XNYS"] * 11])
def test_market_lists_are_checked(codes: list[str]) -> None:
    with pytest.raises(InvalidMarketsError):
        settlement_date(codes, date(2026, 7, 2), 1)


def test_unknown_market() -> None:
    with pytest.raises(UnknownMarketError):
        overlap(["XNYS", "NYSE"], date(2026, 1, 1), date(2026, 1, 2))


def test_settlement_stays_inside_the_library_data() -> None:
    with pytest.raises(YearOutOfRangeError):
        settlement_date(["XNYS"], date(2100, 12, 31), 1)


def test_overlap_keeps_days_open_everywhere() -> None:
    days = overlap(["XNYS", "XSAU"], date(2026, 1, 1), date(2026, 1, 10))

    assert days == [date(2026, 1, 5), date(2026, 1, 6), date(2026, 1, 7), date(2026, 1, 8)]


@pytest.mark.parametrize(
    ("start", "end"),
    [(date(2026, 2, 1), date(2026, 1, 1)), (date(2026, 1, 1), date(2027, 2, 5))],
)
def test_overlap_rejects_bad_ranges(start: date, end: date) -> None:
    with pytest.raises(InvalidRangeError):
        overlap(["XNYS"], start, end)
