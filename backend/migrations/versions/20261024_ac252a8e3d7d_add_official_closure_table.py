"""Add official closure table

Revision ID: ac252a8e3d7d
Revises: 6b88e3280bd6
Create Date: 2026-10-24 18:33:34.066518
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "ac252a8e3d7d"
down_revision: str | None = "6b88e3280bd6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "official_closure",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("market", sa.String(length=10), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("kind", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=False),
        sa.Column("checked_on", sa.Date(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("market", "date"),
    )
    op.create_index(
        op.f("ix_official_closure_market"), "official_closure", ["market"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_official_closure_market"), table_name="official_closure")
    op.drop_table("official_closure")
