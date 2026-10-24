from typing import Any

import pytest
from flask.testing import FlaskClient


def get_json(client: FlaskClient, url: str, status: int = 200) -> Any:
    response = client.get(url)
    assert response.status_code == status
    return response.get_json()


def test_holidays_list_closures_and_half_days(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/markets/XNYS/holidays?year=2026")

    assert body["market"] == "XNYS"
    assert body["year"] == 2026
    by_date = {h["date"]: h for h in body["holidays"]}
    assert by_date["2026-07-03"] == {
        "date": "2026-07-03",
        "name": "Independence Day (observed)",
        "category": "public",
        "half_day": False,
        "close_time": None,
    }
    assert by_date["2026-12-24"]["half_day"] is True


def test_is_trading_day(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/markets/XNYS/is-trading-day?date=2026-07-03")

    assert body == {"market": "XNYS", "date": "2026-07-03", "is_trading_day": False}


@pytest.mark.parametrize(
    ("path", "expected"),
    [("next-trading-day", "2026-07-06"), ("previous-trading-day", "2026-07-02")],
)
def test_adjacent_trading_days(client: FlaskClient, path: str, expected: str) -> None:
    body = get_json(client, f"/api/v1/markets/XNYS/{path}?date=2026-07-03")

    assert body == {"market": "XNYS", "date": "2026-07-03", "trading_day": expected}


def test_trading_days(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/markets/XNYS/trading-days?start=2026-07-01&end=2026-07-07")

    assert body == {
        "market": "XNYS",
        "start": "2026-07-01",
        "end": "2026-07-07",
        "count": 4,
        "days": ["2026-07-01", "2026-07-02", "2026-07-06", "2026-07-07"],
    }


def test_unknown_market(client: FlaskClient) -> None:
    error = get_json(client, "/api/v1/markets/NYSE/holidays?year=2026", 404)["error"]

    assert error["code"] == "unknown_market"
    assert error["params"] == {"market": "NYSE"}


@pytest.mark.parametrize(
    ("query", "field"),
    [
        ("", "year"),
        ("?year=next", "year"),
        ("?year=2026&lang=fr", "lang"),
    ],
)
def test_invalid_year_query(client: FlaskClient, query: str, field: str) -> None:
    error = get_json(client, f"/api/v1/markets/XNYS/holidays{query}", 400)["error"]

    assert error["code"] == "invalid_parameter"
    assert list(error["params"]["fields"]) == [field]


@pytest.mark.parametrize("value", ["2026-7-3", "20260703", "1782950400", "2026-02-30"])
def test_dates_must_be_iso(client: FlaskClient, value: str) -> None:
    error = get_json(client, f"/api/v1/markets/XNYS/is-trading-day?date={value}", 400)["error"]

    assert error["code"] == "invalid_parameter"


def test_year_out_of_range(client: FlaskClient) -> None:
    error = get_json(client, "/api/v1/markets/XLON/holidays?year=1990", 400)["error"]

    assert error["code"] == "year_out_of_range"
    assert error["params"] == {"year": 1990, "first": 2000, "last": 2100}


def test_range_is_capped(client: FlaskClient) -> None:
    url = "/api/v1/markets/XNYS/trading-days?start=2026-01-01&end=2028-01-01"
    error = get_json(client, url, 400)["error"]

    assert error["code"] == "invalid_range"
    assert error["params"] == {"max_days": 400}
