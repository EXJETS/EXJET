"""Writes SYNTHETIC quote and contract PDFs using the API's own test helpers (reportlab).
Run from apps/api:  uv run python ../app/e2e/api/make_pdfs.py <outdir>
"""
import pathlib
import sys

API = pathlib.Path(__file__).resolve().parents[3] / "api"
sys.path.insert(0, str(API / "tests"))
from helpers import PNG, contract_pdf, quote_pdf  # noqa: E402

out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
(out / "quote.pdf").write_bytes(quote_pdf())  # total $45,200.00, payment link host pay.example.com
(out / "contract.pdf").write_bytes(contract_pdf("SYNTHETIC Member"))
(out / "id.png").write_bytes(PNG)
print("ok")
