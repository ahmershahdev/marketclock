from datetime import date

from flask.testing import FlaskClient

from app.api.quality import market_quality
from app.models import OfficialClosure


def test_data_quality_report(client: FlaskClient) -> None:
    body = client.get("/api/v1/data-quality").get_json()

    by_market = {m["market"]: m for m in body["markets"]}
    assert by_market["XNYS"]["years"] == [2026, 2027, 2028]
    assert by_market["XNYS"]["official_days"] == 34
    assert by_market["XNYS"]["differences"] == []
    assert by_market["XLON"]["differences"] == []
    assert by_market["XNAS"]["years"] == [2026]
    assert by_market["XNAS"]["differences"] == []
    assert by_market["XLON"]["sources"] == [
        "https://www.londonstockexchange.com/equities-trading/business-days"
    ]


def test_differences_carry_the_official_name() -> None:
    invented = OfficialClosure(
        market="XNYS",
        date=date(2026, 12, 31),
        kind="closed",
        name="Invented closure",
        source_url="https://example.com",
        checked_on=date(2026, 10, 24),
    )

    report = market_quality("XNYS", [invented])

    missing = [d for d in report.differences if d.kind == "missing_in_library"]
    assert missing[0].official_name == "Invented closure"
    assert any(d.kind == "extra_in_library" for d in report.differences)
