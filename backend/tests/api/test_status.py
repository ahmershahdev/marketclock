from flask.testing import FlaskClient


def test_status_of_one_market_at_a_time(client: FlaskClient) -> None:
    body = client.get("/api/v1/markets/XNYS/status?at=2026-12-24T16:00:00Z").get_json()

    assert body["state"] == "open"
    assert body["detail"] == "early_close"
    assert body["closes_at"] == "2026-12-24T13:00:00-05:00"
    assert body["opens_at"] is None


def test_status_now(client: FlaskClient) -> None:
    body = client.get("/api/v1/markets/XNYS/status").get_json()

    assert body["state"] in {"open", "closed"}


def test_status_needs_a_timezone(client: FlaskClient) -> None:
    response = client.get("/api/v1/markets/XNYS/status?at=2026-12-24T16:00:00")

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_parameter"


def test_status_of_every_market(client: FlaskClient) -> None:
    body = client.get("/api/v1/status?at=2026-07-02T14:00:00Z").get_json()

    by_code = {item["market"]: item for item in body}
    assert len(body) == 30
    assert by_code["XNYS"]["state"] == "open"
    assert by_code["XKAR"]["state"] == "hours_unknown"


def test_markets_without_data_for_the_moment_are_left_out(client: FlaskClient) -> None:
    body = client.get("/api/v1/status?at=2015-03-02T09:00:00Z").get_json()

    assert "XSAU" not in {item["market"] for item in body}
    assert "XNYS" in {item["market"] for item in body}
