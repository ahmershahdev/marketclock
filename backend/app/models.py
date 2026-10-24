import datetime as dt

from sqlalchemy import SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class SettlementCycle(Base):
    __tablename__ = "settlement_cycle"
    __table_args__ = (UniqueConstraint("market", "effective_from"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    market: Mapped[str] = mapped_column(String(10), index=True)
    days: Mapped[int] = mapped_column(SmallInteger)
    effective_from: Mapped[dt.date]
    source_url: Mapped[str] = mapped_column(String(500))


class OfficialClosure(Base):
    __tablename__ = "official_closure"
    __table_args__ = (UniqueConstraint("market", "date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    market: Mapped[str] = mapped_column(String(10), index=True)
    date: Mapped[dt.date]
    kind: Mapped[str] = mapped_column(String(10))
    name: Mapped[str] = mapped_column(String(200))
    source_url: Mapped[str] = mapped_column(String(500))
    checked_on: Mapped[dt.date]
