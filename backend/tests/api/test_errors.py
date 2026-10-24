from flask import Flask
from flask.testing import FlaskClient


def test_unknown_route_uses_the_error_shape(client: FlaskClient) -> None:
    response = client.get("/api/v1/nope")

    assert response.status_code == 404
    error = response.get_json()["error"]
    assert error["code"] == "not_found"
    assert error["message"]
    assert error["params"] == {}


def test_wrong_method_uses_the_error_shape(client: FlaskClient) -> None:
    response = client.post("/api/v1/health")

    assert response.status_code == 405
    assert response.get_json()["error"]["code"] == "method_not_allowed"


def test_unexpected_errors_hide_details(app: Flask) -> None:
    @app.get("/boom")
    def boom() -> str:
        raise RuntimeError("secret detail")

    response = app.test_client().get("/boom")

    assert response.status_code == 500
    body = response.get_json()
    assert body["error"]["code"] == "internal_server_error"
    assert "secret" not in body["error"]["message"]
