import datetime as dt
import re
from typing import Annotated, Any, Literal

from pydantic import (
    AwareDatetime,
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    RootModel,
    WithJsonSchema,
)

ISO_DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


def parse_iso_date(value: str) -> dt.date:
    # Pydantic alone reads a midnight Unix timestamp such as "1782950400" as a date.
    if not ISO_DATE.fullmatch(value):
        raise ValueError("Input should be a date in the format YYYY-MM-DD")
    return dt.date.fromisoformat(value)


IsoDate = Annotated[dt.date, BeforeValidator(parse_iso_date)]


def split_codes(value: str) -> list[str]:
    return [code.strip() for code in value.split(",") if code.strip()]


MarketCodes = Annotated[
    list[str],
    BeforeValidator(split_codes),
    WithJsonSchema({"type": "string", "description": "Comma-separated MICs, such as XNYS,XLON"}),
]


class Query(BaseModel):
    model_config = ConfigDict(extra="forbid")


class YearQuery(Query):
    year: int


class OptionalYearQuery(Query):
    year: int | None = None


class StatusQuery(Query):
    at: AwareDatetime | None = None


class DateQuery(Query):
    date: IsoDate


class RangeQuery(Query):
    start: IsoDate
    end: IsoDate


class SettlementQuery(Query):
    markets: MarketCodes
    trade_date: IsoDate
    cycle: Annotated[int, Field(ge=0, le=10)] | None = None


class AddDaysQuery(Query):
    markets: MarketCodes
    date: IsoDate
    days: int


class OverlapQuery(Query):
    markets: MarketCodes
    start: IsoDate
    end: IsoDate


class TradingSession(BaseModel):
    open: str | None
    close: str | None
    early_close: str | None
    source_url: str


class Market(BaseModel):
    code: str
    name: str
    country: str
    country_code: str
    timezone: str
    weekend: list[int]
    categories: list[str]
    first_year: int
    last_year: int
    source_url: str
    session: TradingSession | None


class MarketList(RootModel[list[Market]]):
    pass


class Holiday(BaseModel):
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)

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


class CycleSource(BaseModel):
    market: str
    days: int
    effective_from: dt.date
    source_url: str


class MarketCycleResponse(BaseModel):
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)

    market: str
    date: dt.date
    cycle: CycleSource | None = None


class SettlementResponse(BaseModel):
    markets: list[str]
    trade_date: dt.date
    cycle: int
    cycle_from: Literal["query", "default"]
    default_cycles: list[CycleSource]
    trade_date_is_trading_day: bool
    settlement_date: dt.date


class AddDaysResponse(BaseModel):
    markets: list[str]
    date: dt.date
    days: int
    result: dt.date


class OverlapResponse(BaseModel):
    markets: list[str]
    start: dt.date
    end: dt.date
    count: int
    days: list[dt.date]


class QualityDifference(BaseModel):
    date: dt.date
    kind: Literal["missing_in_library", "extra_in_library", "category_differs"]
    library: Literal["public", "half_day"] | None
    official: Literal["public", "half_day"] | None
    official_name: str | None


class MarketQuality(BaseModel):
    market: str
    years: list[int]
    official_days: int
    checked_on: dt.date
    sources: list[str]
    differences: list[QualityDifference]


class DataQualityReport(BaseModel):
    markets: list[MarketQuality]


class MarketStatusResponse(BaseModel):
    model_config = ConfigDict(json_schema_serialization_defaults_required=True)

    market: str
    state: Literal["open", "closed", "hours_unknown"]
    detail: Literal["regular", "early_close", "before_open", "after_close", "weekend", "holiday"]
    local_time: dt.datetime
    closes_at: dt.datetime | None = None
    opens_at: dt.datetime | None = None


class MarketStatusList(RootModel[list[MarketStatusResponse]]):
    pass


class ErrorDetail(BaseModel):
    code: str
    message: str
    params: dict[str, Any]


class ErrorResponse(BaseModel):
    error: ErrorDetail
