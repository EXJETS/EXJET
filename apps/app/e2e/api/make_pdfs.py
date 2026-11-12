"""Writes SYNTHETIC quote and contract PDFs using the API's own test helpers (reportlab).
Run from apps/api:  uv run python ../app/e2e/api/make_pdfs.py <outdir>
"""
import pathlib
import sys

API = pathlib.Path(__file__).resolve().parents[3] / "api"
sys.path.insert(0, str(API / "tests"))
from helpers import PNG, contract_pdf, pdf_bytes, quote_pdf  # noqa: E402

out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
(out / "quote.pdf").write_bytes(quote_pdf())  # total $45,200.00, payment link host pay.example.com
(out / "contract.pdf").write_bytes(contract_pdf("SYNTHETIC Member"))
# Quotes whose payment link points at a host that is NOT on the operator's approved list (fraud path). One host per project,
# because approving a host is permanent for the operator and the desktop and mobile runs share one database.
for tag in ("desktop", "mobile"):
    (out / f"quote_other_host_{tag}.pdf").write_bytes(pdf_bytes([
        "SYNTHETIC Test Operator Quote", "Charter Quotation", "Quote No: Q-TEST-0002", "Valid until: December 31, 2099",
        "Aircraft charter ........ $41,000.00", "Fuel and handling ........ $4,200.00", "Subtotal: $45,200.00", "Total Charter Cost: $45,200.00",
    ], links=[("Pay online", f"https://pay.other-{tag}.example.com/checkout/synthetic-999")]))
(out / "id.png").write_bytes(PNG)
print("ok")
