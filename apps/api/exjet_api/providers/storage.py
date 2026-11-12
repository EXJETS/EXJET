"""Private document storage. Local disk for dev (bytes encrypted at rest); S3-compatible is NOT IMPLEMENTED.

Storage keys are random (`<prefix>/<owner id>/<uuid hex>`): they never contain an uploader-supplied filename.
The original filename lives only in the `documents` row.
"""
from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Protocol

from cryptography.fernet import InvalidToken

from ..crypto import decrypt_bytes, encrypt_bytes
from ..security import sign_blob
from .errors import NotImplementedProvider

SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


def safe_filename(name: str) -> str:
    base = name.replace("\\", "/").split("/")[-1]
    return SAFE_NAME.sub("_", base)[:120] or "file"


def new_key(prefix: str, owner_id: uuid.UUID) -> str:
    """Random storage key. Nothing user-supplied is part of it."""
    return f"{prefix}/{owner_id}/{uuid.uuid4().hex}"


class StorageProvider(Protocol):
    name: str

    def put(self, key: str, data: bytes, content_type: str) -> None: ...

    def get(self, key: str) -> bytes: ...

    def signed_url(self, key: str, ttl_seconds: int = 120, claims: dict | None = None) -> str: ...


class LocalStorage:
    """Files are Fernet-encrypted with the PII key before they touch the disk (KYC documents included)."""

    name = "local"

    def __init__(self, root: str) -> None:
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        p = (self.root / key).resolve()
        if self.root not in p.parents:
            raise ValueError("invalid storage key")
        return p

    def put(self, key: str, data: bytes, content_type: str) -> None:
        p = self._path(key)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(encrypt_bytes(data))

    def get(self, key: str) -> bytes:
        try:
            return decrypt_bytes(self._path(key).read_bytes())
        except InvalidToken:
            raise FileNotFoundError(key) from None  # unreadable object: treated as missing, never served raw

    def signed_url(self, key: str, ttl_seconds: int = 120, claims: dict | None = None) -> str:
        """URL served by this API (/v1/files/{token}). The token carries the storage key plus `claims`
        (document id `d` and viewer user id `u`); the route verifies the viewer on redemption."""
        return f"/v1/files/{sign_blob({'k': key, **(claims or {})}, ttl_seconds)}"


class S3Storage:
    """TODO(not implemented): S3-compatible private bucket (R2 or S3). REQUIRED when built: bucket private, no public
    ACLs, server-side encryption on (SSE-S3 or SSE-KMS; enforce with a bucket policy denying unencrypted puts),
    random keys as above, presigned URLs with a short TTL and `response-content-disposition=attachment`.
    A presigned URL cannot be bound to a viewer, so downloads for S3 must be proxied by the API or kept to 120 s."""

    name = "s3"

    def put(self, key, data, content_type):
        raise NotImplementedProvider("S3 storage is not implemented yet")

    def get(self, key):
        raise NotImplementedProvider("S3 storage is not implemented yet")

    def signed_url(self, key, ttl_seconds=120, claims=None):
        raise NotImplementedProvider("S3 storage is not implemented yet")
