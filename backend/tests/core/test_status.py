from datetime import UTC, datetime

import pytest

from app.core.calendar import YearOutOfRangeError
from app.core.status import market_status


def utc(year: int, month: int, day: int, hour: int, minute: int) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


def test_open_on_a_regular_day_in_summer_time() -> None:
    found = market_status("XNYS", utc(2026, 7, 2, 14, 0))

    assert (found.state, found.detail) == ("open", "regular")
    assert found.local_time.hour == 10
    assert found.closes_at is not None
    assert found.closes_at.isoformat() == "2026-07-02T16:00:00-04:00"


def test_before_the_open() -> None:
    found = market_status("XNYS", utc(2026, 7, 2, 12, 0))

    assert (found.state, found.detail) == ("closed", "before_open")
    assert found.opens_at is not None
    assert found.opens_at.isoformat() == "2026-07-02T09:30:00-04:00"


def test_early_close_and_after_it() -> None:
    during = market_status("XNYS", utc(2026, 12, 24, 16, 0))
    after = market_status("XNYS", utc(2026, 12, 24, 18, 30))

    assert (during.state, during.detail) == ("open", "early_close")
    assert during.closes_at is not None
    assert during.closes_at.isoformat() == "2026-12-24T13:00:00-05:00"
    assert (after.state, after.detail) == ("closed", "after_close")
    assert after.opens_at is not None
    assert after.opens_at.isoformat() == "2026-12-28T09:30:00-05:00"


@pytest.mark.parametrize(
    ("at", "detail"),
    [(utc(2026, 7, 4, 15, 0), "weekend"), (utc(2026, 7, 3, 15, 0), "holiday")],
)
def test_closed_days(at: datetime, detail: str) -> None:
    found = market_status("XNYS", at)

    assert (found.state, found.detail) == ("closed", detail)
    assert found.opens_at is not None
    assert found.opens_at.date().isoformat() == "2026-07-06"


def test_local_date_decides_the_day() -> None:
    # Friday 23:00 UTC is already Saturday in Tokyo.
    assert market_status("XJPX", utc(2026, 7, 3, 23, 0)).detail == "weekend"


def test_trading_day_without_hours_on_file() -> None:
    found = market_status("XKAR", utc(2026, 7, 2, 6, 0))

    assert found.state == "hours_unknown"
    assert found.opens_at is None


def test_closed_day_without_hours_on_file() -> None:
    found = market_status("XKAR", utc(2026, 7, 4, 6, 0))

    assert (found.state, found.detail, found.opens_at) == ("closed", "weekend", None)


def test_early_close_alone_is_not_enough_for_open_or_closed() -> None:
    assert market_status("XLON", utc(2026, 7, 2, 10, 0)).state == "hours_unknown"


def test_half_day_without_an_early_close_time_uses_the_regular_close() -> None:
    found = market_status("XHKG", utc(2026, 7, 2, 3, 0))

    assert (found.state, found.detail) == ("open", "regular")


def test_moments_outside_the_library_data() -> None:
    with pytest.raises(YearOutOfRangeError):
        market_status("XSAU", utc(2015, 3, 1, 9, 0))
