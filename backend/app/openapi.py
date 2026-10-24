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
        "/api/v1/markets",
        "listMarkets",
        "Every market in the library with its weekend and timezone",
        schemas.Query,
        schemas.MarketList,
    ),
    Operation(
        MARKET,
        "getMarket",
        "One market with its weekend, timezone and years of data",
        schemas.Query,
        schemas.Market,
    ),
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
    Operation(
        "/api/v1/settlement",
        "getSettlementDate",
        "Settlement date T+n: the n-th day after the trade date on which every market is open",
        schemas.SettlementQuery,
        schemas.SettlementResponse,
    ),
    Operation(
        "/api/v1/overlap",
        "getOverlap",
        "Days from start to end on which every market trades, at most 400 days",
        schemas.OverlapQuery,
        schemas.OverlapResponse,
    ),
)


def _parameters(op: Operation) -> list[dict[str, Any]]:
    model = op.query.model_json_schema()
    query = [
        {"name": name, "in": "query", "required": name in model["required"], "schema": schema}
        for name, schema in model.get("properties", {}).items()
    ]
    if "{code}" not in op.path:
        return query
    code = {"name": "code", "in": "path", "required": True, "schema": {"type": "string"}}
    return [code, *query]


def _content(model: type[BaseModel]) -> dict[str, Any]:
    ref = REF.format(model=model.__name__)
    return {"content": {"application/json": {"schema": {"$ref": ref}}}}


def _responses(op: Operation) -> dict[str, Any]:
    error = _content(schemas.ErrorResponse)
    responses = {
        "200": {"description": "OK", **_content(op.response)},
        "400": {"description": "Invalid parameter", **error},
    }
    if op.path != "/api/v1/markets":
        responses["404"] = {"description": "Unknown market", **error}
    return responses


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
                "parameters": _parameters(op),
                "responses": _responses(op),
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
