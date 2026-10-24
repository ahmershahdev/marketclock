from datetime import date

from sqlalchemy import SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class SettlementCycle(Base):
    __tablename__ = "settlement_cycle"
    __table_args__ = (UniqueConstraint("market", "effective_from"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    market: Mapped[str] = mapped_column(String(10), index=True)
    days: Mapped[int] = mapped_column(SmallInteger)
    effective_from: Mapped[date]
    source_url: Mapped[str] = mapped_column(String(500))
