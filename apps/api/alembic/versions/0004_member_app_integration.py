"""member app integration: leg origin time zone, email verification, enterprise inquiry contact, operator manifest links

Revision ID: 0004
Revises: 0003
Create Date: 2026-11-13 09:00:00

Backfill: trip_legs.origin_timezone is filled from the origin airport's time zone where the airport has one; legs whose
airport has none stay NULL (the API reports null, it never guesses). users.email_verified_at is left NULL for existing
rows (nobody is marked verified by a migration); admins created by seed_dev are verified by the seed. Existing
enterprise_inquiries rows keep NULL contact columns.

Downgrade: drops the new columns and tables (the data in them is lost).
"""
import sqlalchemy as sa

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True))

    op.add_column("trip_legs", sa.Column("origin_timezone", sa.String(64), nullable=True))
    op.execute(
        "UPDATE trip_legs l SET origin_timezone = a.timezone FROM airports a "
        "WHERE a.icao = l.origin_icao AND a.timezone IS NOT NULL"
    )

    op.add_column("enterprise_inquiries", sa.Column("contact_name", sa.Text(), nullable=True))
    op.add_column("enterprise_inquiries", sa.Column("contact_email", sa.Text(), nullable=True))
    op.add_column("enterprise_inquiries", sa.Column("contact_phone", sa.Text(), nullable=True))

    op.create_table(
        "email_verification_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_email_verification_tokens_user_id", "email_verification_tokens", ["user_id"])

    op.create_table(
        "manifest_access_links",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("manifest_id", sa.Uuid(), sa.ForeignKey("manifests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rfq_id", sa.Uuid(), sa.ForeignKey("rfqs.id"), nullable=True),
        sa.Column("recipient", sa.String(320), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("view_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_viewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_manifest_access_links_manifest_id", "manifest_access_links", ["manifest_id"])


def downgrade() -> None:
    op.drop_index("ix_manifest_access_links_manifest_id", table_name="manifest_access_links")
    op.drop_table("manifest_access_links")
    op.drop_index("ix_email_verification_tokens_user_id", table_name="email_verification_tokens")
    op.drop_table("email_verification_tokens")
    op.drop_column("enterprise_inquiries", "contact_phone")
    op.drop_column("enterprise_inquiries", "contact_email")
    op.drop_column("enterprise_inquiries", "contact_name")
    op.drop_column("trip_legs", "origin_timezone")
    op.drop_column("users", "email_verified_at")
