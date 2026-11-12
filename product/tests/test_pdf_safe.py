"""M5: attacker PDFs are parsed once, in a resource-limited subprocess, with size, page and text caps."""
import subprocess

import pytest
from pdfs import QUOTE_LINES, blank_pdf, make_pdf

from exjet_product import pdf_safe
from exjet_product import quote_ingest as Q
from exjet_product.pdf_safe import PdfLimitError, extract_bounded


def test_defaults_match_the_policy():
    assert pdf_safe.DEFAULT_MAX_BYTES == 10 * 1024 * 1024 and pdf_safe.DEFAULT_MAX_PAGES == 50


def test_normal_pdf_text_and_links_come_from_one_parse():
    data = make_pdf([QUOTE_LINES], links=[("Pay online", "https://pay.example.com/x")])
    out = extract_bounded(data)
    assert "Total Charter Cost: $45,200.00" in out.pages[0]
    assert out.links == ["https://pay.example.com/x"]


def test_analyze_pdf_spawns_exactly_one_parser(monkeypatch):
    calls = []
    real = subprocess.run
    monkeypatch.setattr(pdf_safe.subprocess, "run", lambda *a, **k: (calls.append(1), real(*a, **k))[1])
    a = Q.analyze_pdf(make_pdf([QUOTE_LINES], links=[("Pay online", "https://pay.example.com/x")]), "quote.pdf")
    assert len(calls) == 1 and a.doc_type == Q.DOC_QUOTE and a.links == ["https://pay.example.com/x"]


def test_too_large_is_refused_before_anything_is_parsed():
    with pytest.raises(PdfLimitError) as e:
        extract_bounded(b"%PDF-" + b"0" * 2000, max_bytes=1000)
    assert e.value.reason == "too_large"


def test_page_cap():
    data = make_pdf([["page"]] * 6)
    assert len(extract_bounded(data, max_pages=6).pages) == 6
    with pytest.raises(PdfLimitError) as e:
        extract_bounded(data, max_pages=5)
    assert e.value.reason == "too_many_pages"


def test_extracted_text_cap():
    data = make_pdf([["x" * 80] * 20])
    with pytest.raises(PdfLimitError) as e:
        extract_bounded(data, max_chars=500)
    assert e.value.reason == "text_too_long"


def test_memory_rlimit_kills_a_runaway_parser():
    with pytest.raises(PdfLimitError) as e:
        extract_bounded(make_pdf([QUOTE_LINES]), memory_mb=24)
    assert e.value.reason == "resource_limit"


def test_cpu_rlimit_kills_a_runaway_parser():
    with pytest.raises(PdfLimitError) as e:
        extract_bounded(make_pdf([QUOTE_LINES]), cpu_seconds=0)
    assert e.value.reason == "resource_limit"


def test_wall_clock_timeout():
    with pytest.raises(PdfLimitError) as e:
        extract_bounded(make_pdf([QUOTE_LINES]), timeout=0)
    assert e.value.reason == "timeout"


def test_corrupt_encrypted_or_empty_input_is_not_a_limit_breach():
    for junk in (b"%PDF-1.4 garbage", b"not a pdf", b""):
        assert extract_bounded(junk).pages == []
    assert Q.analyze_pdf(blank_pdf(), "scan.pdf").doc_type == Q.DOC_OTHER


def test_child_does_not_inherit_the_environment(monkeypatch):
    monkeypatch.setenv("EXJET_JWT_SECRET", "must-not-reach-the-parser")
    seen = {}
    real = subprocess.run

    def spy(*a, **k):
        seen.update(k.get("env") or {})
        return real(*a, **k)

    monkeypatch.setattr(pdf_safe.subprocess, "run", spy)
    extract_bounded(make_pdf([QUOTE_LINES]))
    assert "EXJET_JWT_SECRET" not in seen and set(seen) == {"PATH"}
