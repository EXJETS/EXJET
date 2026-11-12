"""api gaps: nullable aircraft_types.category, first payment host on the RFQ

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-13 14:00:00

- aircraft_types.category becomes nullable: ingest may now load a type whose category the file does not give (flagged
  `type_needs_category`); such types are excluded from matching and every public listing until a category is supplied.
- rfqs.first_payment_host: the FIRST payment host ever received on the RFQ, stored when the first payment link arrives,
  so `changed_since_first` is stable. Backfilled from the earliest quote's payment link on each RFQ.

Downgrade: rows with a NULL category get the sentinel 'unclassified' (never one of the real categories: nothing is guessed)
so the NOT NULL constraint can return; the new rfqs column is dropped.
"""
import sqlalchemy as sa

from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("aircraft_types", "category", existing_type=sa.String(24), nullable=True)
    op.add_column("rfqs", sa.Column("first_payment_host", sa.String(255), nullable=True))
    op.execute(
        "UPDATE rfqs r SET first_payment_host = x.host FROM ("
        " SELECT DISTINCT ON (q.rfq_id) q.rfq_id, p.host FROM quotes q JOIN payment_links p ON p.quote_id = q.id"
        " ORDER BY q.rfq_id, q.created_at, q.id) x WHERE x.rfq_id = r.id"
    )


def downgrade() -> None:
    op.drop_column("rfqs", "first_payment_host")
    op.execute("UPDATE aircraft_types SET category = 'unclassified' WHERE category IS NULL")
    op.alter_column("aircraft_types", "category", existing_type=sa.String(24), nullable=False)
