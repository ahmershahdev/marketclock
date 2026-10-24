from collections.abc import Sequence
from datetime import date, datetime, timedelta

from app.core.calendar import Holiday

DOMAIN = "marketclock.ahmershah.dev"


ESCAPES = str.maketrans({"\\": r"\\", ";": r"\;", ",": r"\,", "\n": r"\n"})


def _escape(text: str) -> str:
    return text.translate(ESCAPES)


def _fold(line: str) -> list[str]:
    # RFC 5545: at most 75 octets per line; a continuation line starts with one space.
    parts: list[str] = []
    current = ""
    for char in line:
        limit = 75 if not parts else 74
        if len((current + char).encode("utf-8")) > limit:
            parts.append(current)
            current = char
        else:
            current += char
    parts.append(current)
    return [parts[0], *(" " + part for part in parts[1:])]


def _day(value: date) -> str:
    return value.strftime("%Y%m%d")


def calendar_ics(
    code: str,
    name: str,
    holidays: Sequence[Holiday],
    early_close: str | None,
    stamp: datetime,
) -> str:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        f"PRODID:-//MarketClock//{code} holidays//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{_escape(f'{code} market holidays')}",
        f"X-WR-CALDESC:{_escape(f'Closures and early closes for {name}, from MarketClock')}",
    ]
    for holiday in holidays:
        if holiday.category == "half_day":
            what = f"early close {early_close}" if early_close else "early close"
        else:
            what = "closed"
        lines += [
            "BEGIN:VEVENT",
            f"UID:{code}-{_day(holiday.date)}-{holiday.category}@{DOMAIN}",
            f"DTSTAMP:{stamp.strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART;VALUE=DATE:{_day(holiday.date)}",
            f"DTEND;VALUE=DATE:{_day(holiday.date + timedelta(days=1))}",
            f"SUMMARY:{_escape(f'{code} {what}: {holiday.name}')}",
            "TRANSP:TRANSPARENT",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    return "".join(f"{folded}\r\n" for line in lines for folded in _fold(line))
