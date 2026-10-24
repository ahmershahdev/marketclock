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
        "markets=XNYS&trade_date=2026-07-02",
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
