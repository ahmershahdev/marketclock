import datetime as dt
import re
from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict

ISO_DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


def parse_iso_date(value: str) -> dt.date:
    # Pydantic alone reads a midnight Unix timestamp such as "1782950400" as a date.
    if not ISO_DATE.fullmatch(value):
        raise ValueError("Input should be a date in the format YYYY-MM-DD")
    return dt.date.fromisoformat(value)


IsoDate = Annotated[dt.date, BeforeValidator(parse_iso_date)]


class Query(BaseModel):
    model_config = ConfigDict(extra="forbid")


class YearQuery(Query):
    year: int


class DateQuery(Query):
    date: IsoDate


class RangeQuery(Query):
    start: IsoDate
    end: IsoDate


class Holiday(BaseModel):
    date: dt.date
    name: str
    category: Literal["public", "half_day"]
    half_day: bool
    close_time: str | None = None


class HolidaysResponse(BaseModel):
    market: str
    year: int
    holidays: list[Holiday]


class TradingDayResponse(BaseModel):
    market: str
    date: dt.date
    is_trading_day: bool


class AdjacentTradingDayResponse(BaseModel):
    market: str
    date: dt.date
    trading_day: dt.date


class TradingDaysResponse(BaseModel):
    market: str
    start: dt.date
    end: dt.date
    count: int
    days: list[dt.date]
