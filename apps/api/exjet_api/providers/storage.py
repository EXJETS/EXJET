"""Private document storage. Local disk for dev; S3-compatible is NOT IMPLEMENTED."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Protocol

from ..security import sign_blob
from .errors import NotImplementedProvider

SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


def safe_filename(name: str) -> str:
    base = name.replace("\\", "/").split("/")[-1]
    return SAFE_NAME.sub("_", base)[:120] or "file"


class StorageProvider(Protocol):
    name: str

    def put(self, key: str, data: bytes, content_type: str) -> None: ...

    def get(self, key: str) -> bytes: ...

    def signed_url(self, key: str, ttl_seconds: int = 120) -> str: ...


class LocalStorage:
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
        p.write_bytes(data)

    def get(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def signed_url(self, key: str, ttl_seconds: int = 120) -> str:
        """URL served by this API (/v1/files/{token}); the token is signed and expires."""
        return f"/v1/files/{sign_blob({'k': key}, ttl_seconds)}"


class S3Storage:
    """TODO(not implemented): S3-compatible private bucket (R2 or S3) with server-side encryption and presigned URLs."""

    name = "s3"

    def put(self, key, data, content_type):
        raise NotImplementedProvider("S3 storage is not implemented yet")

    def get(self, key):
        raise NotImplementedProvider("S3 storage is not implemented yet")

    def signed_url(self, key, ttl_seconds=120):
        raise NotImplementedProvider("S3 storage is not implemented yet")
