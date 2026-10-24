from collections import defaultdict
from collections.abc import Sequence

from sqlalchemy import Engine, select
from sqlalchemy.orm import Session

from app.core.settlement import Cycle
from app.models import SettlementCycle


def load_cycles(engine: Engine, codes: Sequence[str]) -> dict[str, list[Cycle]]:
    found: dict[str, list[Cycle]] = defaultdict(list)
    with Session(engine) as session:
        rows = session.scalars(select(SettlementCycle).where(SettlementCycle.market.in_(codes)))
        for row in rows:
            found[row.market].append(Cycle(row.days, row.effective_from, row.source_url))
    return dict(found)
