from typing import Any

import pytest
from flask.testing import FlaskClient


def get_json(client: FlaskClient, url: str, status: int = 200) -> Any:
    response = client.get(url)
    assert response.status_code == status
    return response.get_json()


def test_settlement(client: FlaskClient) -> None:
    url = "/api/v1/settlement?markets=XNYS,XLON&trade_date=2026-12-23&cycle=2"

    assert get_json(client, url) == {
        "markets": ["XNYS", "XLON"],
        "trade_date": "2026-12-23",
        "cycle": 2,
        "cycle_from": "query",
        "default_cycles": [],
        "trade_date_is_trading_day": True,
        "settlement_date": "2026-12-29",
    }


def test_overlap(client: FlaskClient) -> None:
    url = "/api/v1/overlap?markets=XNYS,XSAU&start=2026-01-01&end=2026-01-10"
    body = get_json(client, url)

    assert body["count"] == 4
    assert body["days"][0] == "2026-01-05"


@pytest.mark.parametrize(
    "query",
    [
        "markets=XNYS&trade_date=2026-07-02&cycle=11",
        "markets=XNYS&trade_date=07/02/2026&cycle=1",
    ],
)
def test_settlement_query_is_validated(client: FlaskClient, query: str) -> None:
    error = get_json(client, f"/api/v1/settlement?{query}", 400)["error"]

    assert error["code"] == "invalid_parameter"


def test_market_list_errors(client: FlaskClient) -> None:
    error = get_json(client, "/api/v1/overlap?markets=,&start=2026-01-01&end=2026-01-02", 400)

    assert error["error"]["code"] == "invalid_markets"
    assert error["error"]["params"] == {"max_markets": 10}


def test_unknown_market_in_list(client: FlaskClient) -> None:
    url = "/api/v1/overlap?markets=XNYS,PSX&start=2026-01-01&end=2026-01-02"

    assert get_json(client, url, 404)["error"]["params"] == {"market": "PSX"}


def test_settlement_uses_the_cycle_in_force_without_a_cycle(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/settlement?markets=XNYS&trade_date=2026-07-02")

    assert body["cycle"] == 1
    assert body["cycle_from"] == "default"
    assert body["settlement_date"] == "2026-07-06"
    assert body["default_cycles"][0]["source_url"].startswith("https://www.sec.gov/")


def test_old_trades_use_the_old_cycle(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/settlement?markets=XNYS&trade_date=2020-01-02")

    assert body["cycle"] == 2


def test_the_longest_default_wins_across_markets(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/settlement?markets=XTSE,XNAS&trade_date=2024-05-27")

    assert body["cycle"] == 2


def test_markets_without_a_default_cycle(client: FlaskClient) -> None:
    error = get_json(client, "/api/v1/settlement?markets=XNYS,XKAR&trade_date=2026-07-02", 400)

    assert error["error"]["code"] == "no_default_cycle"
    assert error["error"]["params"] == {"markets": ["XKAR"]}


def test_default_cycle_checks_market_codes(client: FlaskClient) -> None:
    error = get_json(client, "/api/v1/settlement?markets=NYSE&trade_date=2026-07-02", 404)

    assert error["error"]["code"] == "unknown_market"


def test_settlement_cycle_of_a_market(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/markets/XLON/settlement-cycle?date=2027-10-11")

    assert body["cycle"]["days"] == 1
    assert body["cycle"]["source_url"] == "https://www.fca.org.uk/markets/about-t1-settlement"


def test_settlement_cycle_is_null_when_unknown(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/markets/XLON/settlement-cycle?date=2026-10-24")

    assert body == {"market": "XLON", "date": "2026-10-24", "cycle": None}


def test_settlement_cycle_of_an_unknown_market(client: FlaskClient) -> None:
    get_json(client, "/api/v1/markets/NYSE/settlement-cycle?date=2026-10-24", 404)


def test_add_trading_days(client: FlaskClient) -> None:
    body = get_json(client, "/api/v1/add-trading-days?markets=XNYS&date=2026-07-06&days=-1")

    assert body == {"markets": ["XNYS"], "date": "2026-07-06", "days": -1, "result": "2026-07-02"}


def test_add_trading_days_rejects_zero(client: FlaskClient) -> None:
    error = get_json(client, "/api/v1/add-trading-days?markets=XNYS&date=2026-07-06&days=0", 400)

    assert error["error"]["code"] == "invalid_range"
