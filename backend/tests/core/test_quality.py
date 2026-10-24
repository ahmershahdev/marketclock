from datetime import date

from app.core.calendar import Category
from app.core.quality import Difference, compare


def test_matching_calendars_have_no_differences() -> None:
    days: dict[date, Category] = {date(2026, 1, 1): "public", date(2026, 12, 24): "half_day"}

    assert compare(days, days) == []


def test_every_kind_of_difference() -> None:
    library: dict[date, Category] = {date(2026, 1, 1): "public", date(2026, 12, 24): "public"}
    official: dict[date, Category] = {
        date(2026, 12, 24): "half_day",
        date(2026, 12, 31): "public",
    }

    assert compare(library, official) == [
        Difference(date(2026, 1, 1), "extra_in_library", "public", None),
        Difference(date(2026, 12, 24), "category_differs", "public", "half_day"),
        Difference(date(2026, 12, 31), "missing_in_library", None, "public"),
    ]
