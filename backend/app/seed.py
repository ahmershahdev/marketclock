from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import SettlementCycle

SEC_T2 = "https://www.sec.gov/newsroom/press-releases/2017-68-0"
SEC_T1 = "https://www.sec.gov/newsroom/press-releases/2023-29"
CSA_T1 = (
    "https://www.asc.ca/en/news-and-publications/news-releases/2024/05/"
    "may-27-canadian-securities-regulators-announce-move-to-t1-settlement-cycle"
)
FCA_T1 = "https://www.fca.org.uk/markets/about-t1-settlement"

# Only rows whose source page was read and confirmed; a market with no row has no default.
SETTLEMENT_CYCLES: list[tuple[str, int, date, str]] = [
    ("XNYS", 2, date(2017, 9, 5), SEC_T2),
    ("XNYS", 1, date(2024, 5, 28), SEC_T1),
    ("XNAS", 2, date(2017, 9, 5), SEC_T2),
    ("XNAS", 1, date(2024, 5, 28), SEC_T1),
    ("XTSE", 1, date(2024, 5, 27), CSA_T1),
    ("XLON", 1, date(2027, 10, 11), FCA_T1),
]


def seed_settlement_cycles(session: Session) -> int:
    existing = {
        (row.market, row.effective_from): row for row in session.scalars(select(SettlementCycle))
    }
    for market, days, effective_from, source_url in SETTLEMENT_CYCLES:
        row = existing.get((market, effective_from))
        if row is None:
            session.add(
                SettlementCycle(
                    market=market, days=days, effective_from=effective_from, source_url=source_url
                )
            )
        else:
            row.days, row.source_url = days, source_url
    session.commit()
    return len(SETTLEMENT_CYCLES)
