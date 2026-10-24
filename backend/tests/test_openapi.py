from flask.testing import FlaskClient

from app.openapi import SCHEMA_PATH, build, render


def test_committed_schema_is_current() -> None:
    assert SCHEMA_PATH.read_text(encoding="utf-8") == render(), (
        "Run python write_openapi.py in backend/ and commit openapi.json"
    )


def test_every_operation_is_a_registered_route(client: FlaskClient) -> None:
    rules = {
        rule.rule.replace("<code>", "{code}") for rule in client.application.url_map.iter_rules()
    }

    assert set(build()["paths"]) <= rules


def test_schema_is_served(client: FlaskClient) -> None:
    response = client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    assert response.get_json() == build()
