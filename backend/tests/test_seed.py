from flask import Flask
from sqlalchemy import Engine, func, select
from sqlalchemy.orm import Session

from app.models import OfficialClosure, SettlementCycle
from app.seed import (
    OFFICIAL_CLOSURES,
    SETTLEMENT_CYCLES,
    seed_official_closures,
    seed_settlement_cycles,
)


def count(engine: Engine) -> int:
    with Session(engine) as session:
        return session.scalar(select(func.count()).select_from(SettlementCycle)) or 0


def test_seed_is_idempotent_and_fixes_changed_rows(app: Flask) -> None:
    engine: Engine = app.extensions["engine"]
    with Session(engine) as session:
        row = session.scalars(
            select(SettlementCycle).where(SettlementCycle.market == "XNYS")
        ).first()
        assert row is not None
        row.days = 9
        session.commit()
        seed_settlement_cycles(session)
        session.refresh(row)
        assert row.days in {1, 2}

    assert count(engine) == len(SETTLEMENT_CYCLES)


def test_every_seeded_cycle_has_an_https_source() -> None:
    for market, days, _, source_url in SETTLEMENT_CYCLES:
        assert len(market) == 4
        assert 0 <= days <= 10
        assert source_url.startswith("https://")


def test_seed_command(app: Flask) -> None:
    result = app.test_cli_runner().invoke(args=["seed"])

    assert result.exit_code == 0
    assert f"Seeded {len(SETTLEMENT_CYCLES)} settlement cycles" in result.output
    assert f"{len(OFFICIAL_CLOSURES)} official closures" in result.output


def test_official_closure_seed_is_idempotent(app: Flask) -> None:
    engine: Engine = app.extensions["engine"]
    with Session(engine) as session:
        row = session.scalars(select(OfficialClosure)).first()
        assert row is not None
        row.name = "changed"
        session.commit()
        seed_official_closures(session)
        session.refresh(row)
        assert row.name != "changed"
        total = session.scalar(select(func.count()).select_from(OfficialClosure))

    assert total == len(OFFICIAL_CLOSURES)


def test_official_closures_cover_whole_years() -> None:
    by_market: dict[str, set[int]] = {}
    for market, day, kind, _, source_url in OFFICIAL_CLOSURES:
        by_market.setdefault(market, set()).add(day.year)
        assert kind in {"closed", "half_day"}
        assert source_url.startswith("https://")
    assert by_market == {"XNYS": {2026, 2027, 2028}, "XLON": {2027, 2028}}
