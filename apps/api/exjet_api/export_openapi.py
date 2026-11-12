"""Write apps/api/openapi.json. Run: uv run python -m exjet_api.export_openapi"""
from __future__ import annotations

import json
from pathlib import Path

from .main import app


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "openapi.json"
    out.write_text(json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
