"""Add settlement cycle table

Revision ID: 6b88e3280bd6
Revises:
Create Date: 2026-10-24 18:02:35.282001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "6b88e3280bd6"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "settlement_cycle",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("market", sa.String(length=10), nullable=False),
        sa.Column("days", sa.SmallInteger(), nullable=False),
        sa.Column("effective_from", sa.Date(), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("market", "effective_from"),
    )
    op.create_index(
        op.f("ix_settlement_cycle_market"), "settlement_cycle", ["market"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_settlement_cycle_market"), table_name="settlement_cycle")
    op.drop_table("settlement_cycle")
