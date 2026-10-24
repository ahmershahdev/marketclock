from itertools import groupby

from flask import Blueprint, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.markets import json_response, parse_query
from app.core.calendar import Category, market_holidays
from app.core.quality import compare
from app.db import get_engine
from app.models import OfficialClosure
from app.schemas import DataQualityReport, MarketQuality, QualityDifference, Query

bp = Blueprint("quality", __name__)

KINDS: dict[str, Category] = {"closed": "public", "half_day": "half_day"}


def market_quality(market: str, rows: list[OfficialClosure]) -> MarketQuality:
    years = sorted({row.date.year for row in rows})
    library = {h.date: h.category for year in years for h in market_holidays(market, year)}
    official = {row.date: KINDS[row.kind] for row in rows}
    names = {row.date: row.name for row in rows}
    return MarketQuality(
        market=market,
        years=years,
        official_days=len(rows),
        checked_on=max(row.checked_on for row in rows),
        sources=sorted({row.source_url for row in rows}),
        differences=[
            QualityDifference(
                date=d.date,
                kind=d.kind,
                library=d.library,
                official=d.official,
                official_name=names.get(d.date),
            )
            for d in compare(library, official)
        ],
    )


@bp.get("/data-quality")
def data_quality() -> Response:
    parse_query(Query)
    with Session(get_engine()) as session:
        rows = session.scalars(
            select(OfficialClosure).order_by(OfficialClosure.market, OfficialClosure.date)
        ).all()
        report = DataQualityReport(
            markets=[
                market_quality(market, list(group))
                for market, group in groupby(rows, key=lambda row: row.market)
            ]
        )
    return json_response(report)
