from flask import Flask
from sqlalchemy import Engine, func, select
from sqlalchemy.orm import Session

from app.models import SettlementCycle
from app.seed import SETTLEMENT_CYCLES, seed_settlement_cycles


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
