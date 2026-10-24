import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from pydantic import BaseModel
from pydantic.json_schema import models_json_schema

from app import schemas

SCHEMA_PATH = Path(__file__).resolve().parents[1] / "openapi.json"
REF = "#/components/schemas/{model}"


@dataclass(frozen=True)
class Operation:
    path: str
    operation_id: str
    summary: str
    query: type[schemas.Query]
    response: type[BaseModel]


MARKET = "/api/v1/markets/{code}"
OPERATIONS = (
    Operation(
        f"{MARKET}/holidays",
        "getHolidays",
        "Closures and half days of a market in one year",
        schemas.YearQuery,
        schemas.HolidaysResponse,
    ),
    Operation(
        f"{MARKET}/is-trading-day",
        "isTradingDay",
        "Whether the market is open on a date",
        schemas.DateQuery,
        schemas.TradingDayResponse,
    ),
    Operation(
        f"{MARKET}/next-trading-day",
        "getNextTradingDay",
        "First trading day after a date",
        schemas.DateQuery,
        schemas.AdjacentTradingDayResponse,
    ),
    Operation(
        f"{MARKET}/previous-trading-day",
        "getPreviousTradingDay",
        "Last trading day before a date",
        schemas.DateQuery,
        schemas.AdjacentTradingDayResponse,
    ),
    Operation(
        f"{MARKET}/trading-days",
        "getTradingDays",
        "Trading days from start to end, both included, at most 400 days",
        schemas.RangeQuery,
        schemas.TradingDaysResponse,
    ),
)


def _parameters(query: type[schemas.Query]) -> list[dict[str, Any]]:
    code = {"name": "code", "in": "path", "required": True, "schema": {"type": "string"}}
    model = query.model_json_schema()
    return [code] + [
        {"name": name, "in": "query", "required": name in model["required"], "schema": schema}
        for name, schema in model["properties"].items()
    ]


def _content(model: type[BaseModel]) -> dict[str, Any]:
    ref = REF.format(model=model.__name__)
    return {"content": {"application/json": {"schema": {"$ref": ref}}}}


def build() -> dict[str, Any]:
    models = {op.response for op in OPERATIONS} | {schemas.ErrorResponse}
    _, definitions = models_json_schema(
        [(model, "serialization") for model in sorted(models, key=lambda m: m.__name__)],
        ref_template=REF,
    )
    paths = {
        op.path: {
            "get": {
                "operationId": op.operation_id,
                "summary": op.summary,
                "parameters": _parameters(op.query),
                "responses": {
                    "200": {"description": "OK", **_content(op.response)},
                    "400": {"description": "Invalid parameter", **_content(schemas.ErrorResponse)},
                    "404": {"description": "Unknown market", **_content(schemas.ErrorResponse)},
                },
            }
        }
        for op in OPERATIONS
    }
    return {
        "openapi": "3.1.0",
        "info": {"title": "MarketClock API", "version": "1.0.0"},
        "paths": paths,
        "components": {"schemas": definitions["$defs"]},
    }


def render() -> str:
    return json.dumps(build(), indent=2, sort_keys=True) + "\n"
