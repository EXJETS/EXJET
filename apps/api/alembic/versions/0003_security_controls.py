"""security controls: sessions, seats/invitations, per-member identity, payment host pinning, quarantine,
rate limits, billing idempotency, PII encryption columns, suppression index, ground RFQ uniqueness

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-12 23:00:00

Data migration: NOT performed. There is no production data yet. Columns that become encrypted
(accounts.display_name, passengers.id_issuer, email_messages.body_text, trips.raw_request, trips.notes) are
plain TEXT in the database either way; a row written before this revision holds plaintext, which the
application cannot decrypt, so any pre-existing dev rows in those columns must be deleted (or re-created)
before running the new code. Rows that CAN be derived are backfilled: operators.name_norm / legal_name_norm,
owners' account_members.identity_status (from the account KYC status), lower-cased suppressions.

Downgrade: reverses the schema. accounts.display_name and passengers.id_issuer are narrowed back to VARCHAR with
left(); encrypted values would be truncated, so downgrade only on a database without real data.
"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- users: revocable sessions
    op.add_column("users", sa.Column("session_version", sa.Integer(), server_default="0", nullable=False))

    # --- PII columns that become encrypted
    op.alter_column("accounts", "display_name", existing_type=sa.String(200), type_=sa.Text(), existing_nullable=False)
    op.alter_column("passengers", "id_issuer", existing_type=sa.String(64), type_=sa.Text(), existing_nullable=True)

    # --- per-member identity and seat overage
    op.add_column("account_members", sa.Column("identity_status", sa.String(16), server_default="not_started", nullable=False))
    op.add_column("account_members", sa.Column("is_suspended", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.execute(
        "UPDATE account_members m SET identity_status = a.kyc_status FROM accounts a "
        "WHERE m.account_id = a.id AND m.is_owner"
    )
    op.add_column("kyc_submissions", sa.Column("subject_user_id", sa.Uuid(), nullable=True))
    op.create_foreign_key("fk_kyc_submissions_subject_user", "kyc_submissions", "users", ["subject_user_id"], ["id"])
    op.create_index("ix_kyc_submissions_subject_user_id", "kyc_submissions", ["subject_user_id"])

    # --- billing: monotonic event time + idempotency ledger
    op.add_column("subscriptions", sa.Column("last_event_at", sa.DateTime(timezone=True), nullable=True))
    op.create_table(
        "billing_events",
        sa.Column("event_id", sa.String(128), primary_key=True),
        sa.Column("event_type", sa.String(48), nullable=False),
        sa.Column("account_id", sa.Uuid(), nullable=True),
        sa.Column("event_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("outcome", sa.String(24), nullable=False, server_default="applied"),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # --- operators: payment host pinning + normalized names for the shared exclusion matcher
    op.add_column("operators", sa.Column("payment_hosts", sa.JSON(), server_default=sa.text("'[]'::json"), nullable=True))
    op.add_column("operators", sa.Column("name_norm", sa.Text(), nullable=True))
    op.add_column("operators", sa.Column("legal_name_norm", sa.Text(), nullable=True))
    from exjet_api.opname import normalize_operator_name

    conn = op.get_bind()
    for oid, dba, legal in conn.execute(sa.text("SELECT id, dba_name, legal_name FROM operators")).all():
        conn.execute(
            sa.text("UPDATE operators SET name_norm = :a, legal_name_norm = :b WHERE id = :i"),
            {"a": normalize_operator_name(dba), "b": normalize_operator_name(legal), "i": oid},
        )

    # --- rfqs: ground request uniqueness; free text out of jobs.payload
    op.add_column("rfqs", sa.Column("leg_sequence", sa.Integer(), nullable=True))
    op.add_column("rfqs", sa.Column("details", sa.Text(), nullable=True))
    op.create_index(
        "uq_rfqs_ground", "rfqs", ["trip_id", "fbo_id", "kind", "leg_sequence"], unique=True,
        postgresql_where=sa.text("fbo_id IS NOT NULL"),
    )

    # --- inbound authentication + quarantine
    op.add_column("email_messages", sa.Column("auth_result", sa.JSON(), nullable=True))
    op.add_column("email_messages", sa.Column("quarantine_reason", sa.String(64), nullable=True))

    # --- suppressions: one row per case-folded address
    op.execute("UPDATE suppressions SET email = lower(btrim(email))")
    op.execute(
        "DELETE FROM suppressions a USING suppressions b WHERE lower(a.email) = lower(b.email) AND a.created_at > b.created_at"
    )
    op.execute("DELETE FROM suppressions a USING suppressions b WHERE a.id > b.id AND lower(a.email) = lower(b.email)")
    op.create_index("uq_suppressions_email_lower", "suppressions", [sa.text("lower(email)")], unique=True)

    # --- new tables
    op.create_table(
        "seat_invitations",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("account_id", sa.Uuid(), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("accepted_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("invited_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_seat_invitations_account_id", "seat_invitations", ["account_id"])
    op.create_index("ix_seat_invitations_email", "seat_invitations", ["email"])
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"])
    op.create_table(
        "rate_limits",
        sa.Column("key", sa.String(200), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("key", "window_start"),
    )
    op.create_index("ix_rate_limits_window", "rate_limits", ["window_start"])
    op.create_table(
        "enterprise_inquiries",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("account_id", sa.Uuid(), sa.ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("company", sa.Text(), nullable=False),
        sa.Column("seats", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("enterprise_inquiries")
    op.drop_index("ix_rate_limits_window", table_name="rate_limits")
    op.drop_table("rate_limits")
    op.drop_index("ix_password_reset_tokens_user_id", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")
    op.drop_index("ix_seat_invitations_email", table_name="seat_invitations")
    op.drop_index("ix_seat_invitations_account_id", table_name="seat_invitations")
    op.drop_table("seat_invitations")

    op.drop_index("uq_suppressions_email_lower", table_name="suppressions")

    op.drop_column("email_messages", "quarantine_reason")
    op.drop_column("email_messages", "auth_result")

    op.drop_index("uq_rfqs_ground", table_name="rfqs")
    op.drop_column("rfqs", "details")
    op.drop_column("rfqs", "leg_sequence")

    op.drop_column("operators", "legal_name_norm")
    op.drop_column("operators", "name_norm")
    op.drop_column("operators", "payment_hosts")

    op.drop_table("billing_events")
    op.drop_column("subscriptions", "last_event_at")

    op.drop_index("ix_kyc_submissions_subject_user_id", table_name="kyc_submissions")
    op.drop_constraint("fk_kyc_submissions_subject_user", "kyc_submissions", type_="foreignkey")
    op.drop_column("kyc_submissions", "subject_user_id")
    op.drop_column("account_members", "is_suspended")
    op.drop_column("account_members", "identity_status")

    op.alter_column("passengers", "id_issuer", existing_type=sa.Text(), type_=sa.String(64), existing_nullable=True,
                    postgresql_using="left(id_issuer, 64)")
    op.alter_column("accounts", "display_name", existing_type=sa.Text(), type_=sa.String(200), existing_nullable=False,
                    postgresql_using="left(display_name, 200)")
    op.drop_column("users", "session_version")
