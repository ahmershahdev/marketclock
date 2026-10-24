from datetime import UTC, date, datetime

from app.core.calendar import Holiday
from app.core.ics import calendar_ics

STAMP = datetime(2026, 10, 24, 12, 0, tzinfo=UTC)


def lines(text: str) -> list[str]:
    return text.split("\r\n")


def test_events_are_all_day_with_stable_ids() -> None:
    feed = calendar_ics(
        "XNYS",
        "New York Stock Exchange",
        [Holiday(date(2026, 7, 3), "Independence Day", "public")],
        None,
        STAMP,
    )

    assert feed.startswith("BEGIN:VCALENDAR\r\n")
    assert feed.endswith("END:VCALENDAR\r\n")
    assert "UID:XNYS-20260703-public@marketclock.ahmershah.dev" in lines(feed)
    assert "DTSTART;VALUE=DATE:20260703" in lines(feed)
    assert "DTEND;VALUE=DATE:20260704" in lines(feed)
    assert "DTSTAMP:20261024T120000Z" in lines(feed)
    assert "SUMMARY:XNYS closed: Independence Day" in lines(feed)


def test_half_days_show_the_close_time_when_known() -> None:
    half = [Holiday(date(2026, 12, 24), "Christmas Eve", "half_day")]

    assert "SUMMARY:XNYS early close 13:00: Christmas Eve" in calendar_ics(
        "XNYS", "N", half, "13:00", STAMP
    )
    assert "SUMMARY:XNZE early close: Christmas Eve" in calendar_ics("XNZE", "N", half, None, STAMP)


def test_text_is_escaped() -> None:
    feed = calendar_ics("XKAR", "A; B, C\\D", [], None, STAMP)

    assert "X-WR-CALDESC:Closures and early closes for A\\; B\\, C\\\\D\\, from MarketClock" in feed


def test_long_lines_are_folded_to_75_octets() -> None:
    name = "Day of " + "é" * 60
    feed = calendar_ics("XNYS", "N", [Holiday(date(2026, 1, 1), name, "public")], None, STAMP)

    assert all(len(line.encode("utf-8")) <= 75 for line in lines(feed))
    unfolded = feed.replace("\r\n ", "")
    assert f"SUMMARY:XNYS closed: {name}" in unfolded
