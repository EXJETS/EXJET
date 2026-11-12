"""Short-lived download URLs for stored documents."""
from __future__ import annotations

import uuid

from ..models import Document
from ..providers import get_storage


def signed_document_url(doc: Document, viewer_user_id: uuid.UUID, ttl_seconds: int = 120) -> str:
    """Bound to this document and this viewer: the file route verifies both on redemption."""
    return get_storage().signed_url(doc.storage_key, ttl_seconds, {"d": str(doc.id), "u": str(viewer_user_id)})
