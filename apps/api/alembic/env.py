from logging.config import fileConfig

from sqlalchemy import create_engine, pool

from alembic import context
from exjet_api import models  # noqa: F401  (registers tables on Base.metadata)
from exjet_api.config import get_settings
from exjet_api.crypto import EncryptedStr
from exjet_api.db import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)
target_metadata = Base.metadata


def render_item(type_, obj, autogen_context):
    # Encrypted columns are plain TEXT in the database; keep migrations independent of application code.
    if type_ == "type" and isinstance(obj, EncryptedStr):
        return "sa.Text()"
    return False


def run_migrations_offline() -> None:
    context.configure(url=get_settings().database_url, target_metadata=target_metadata, literal_binds=True,
                      dialect_opts={"paramstyle": "named"}, compare_type=True, render_item=render_item)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(get_settings().database_url, poolclass=pool.NullPool)
    with engine.connect() as conn:
        context.configure(connection=conn, target_metadata=target_metadata, compare_type=True, render_item=render_item)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
