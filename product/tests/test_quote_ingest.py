from datetime import timezone

from pdfs import QUOTE_LINES, blank_pdf, make_pdf

from exjet_product import quote_ingest as Q


def analyze(lines, **kw):
    return Q.analyze_pdf(make_pdf([lines], **kw), "quote.pdf")


def test_clean_quote_is_ready_with_verified_total():
    a = analyze(QUOTE_LINES)
    assert a.doc_type == Q.DOC_QUOTE
    ex = a.extraction
    assert ex.total_cents == 4_520_000 and ex.currency == "USD"
    assert ex.quote_number == "Q-2026-0042"
    assert ex.valid_until and ex.valid_until.tzinfo == timezone.utc and ex.valid_until.day == 20
    assert [i.amount_cents for i in ex.line_items] == [3_800_000, 420_000, 300_000]
    assert ex.confidence >= Q.READY_THRESHOLD and ex.ready and ex.flags == []
    assert all(i.page == 1 for i in ex.line_items)


def test_subtotal_is_never_the_total():
    lines = [x for x in QUOTE_LINES if not x.startswith("Total")]
    ex = analyze(lines).extraction
    assert ex.total_cents is None and "total_not_found" in ex.flags and not ex.ready


def test_two_different_grand_totals_is_ambiguous_not_guessed():
    lines = QUOTE_LINES[:-1] + ["Grand Total: $45,200.00", "Grand Total: $47,500.00"]
    ex = analyze(lines).extraction
    assert ex.total_cents is None and "ambiguous_total" in ex.flags and ex.confidence == 0.0


def test_multiple_distinct_totals_need_review():
    lines = QUOTE_LINES[:-1] + ["Total Charter Cost: $45,200.00", "Total Due: $46,800.00"]
    ex = analyze(lines).extraction
    assert ex.total_cents == 4_680_000  # higher-priority label wins
    assert "multiple_distinct_totals" in ex.flags and not ex.ready


def test_line_items_that_do_not_sum_need_review():
    lines = QUOTE_LINES[:6] + ["Total Charter Cost: $45,200.00"]
    ex = analyze(lines).extraction
    assert ex.total_cents == 4_520_000
    assert "line_items_do_not_sum_to_total" in ex.flags and not ex.ready


def test_no_text_layer_is_unreadable():
    a = Q.analyze_pdf(blank_pdf(), "scan.pdf")
    assert a.doc_type == Q.DOC_OTHER and a.extraction is None
    ex = Q.extract_quote(Q.extract_pdf_pages(blank_pdf()))
    assert ex.total_cents is None and "no_text_layer" in ex.flags


def test_corrupt_pdf_is_unreadable_not_an_exception():
    assert Q.extract_pdf_pages(b"%PDF-1.4 garbage") == []
    assert Q.analyze_pdf(b"not a pdf", "x.pdf").doc_type == Q.DOC_OTHER


def test_non_usd_is_flagged_for_review():
    lines = ["Charter Quotation", "Total Charter Cost: EUR 38,000.00"]
    ex = analyze(lines).extraction
    assert ex.currency == "EUR" and "non_usd_currency" in ex.flags and not ex.ready


def test_amount_verification_requires_verbatim_presence():
    text = "Total Charter Cost: $45,200.00 and a deposit of $5,000"
    assert Q.amount_in_text(4_520_000, text)
    assert Q.amount_in_text(500_000, text)
    assert not Q.amount_in_text(452_000, text)  # substring of a larger number must not count
    assert not Q.amount_in_text(4_520_001, text)
    assert not Q.amount_in_text(4_520_000, "or 45,200.005")


def test_llm_output_is_verified_against_pdf_text():
    pages = ["Charter Quotation", "Total: $38,000.00", "Quote number QX-77"]
    ok = Q.verify_llm_extraction({"total_amount_cents": 3_800_000, "operator_quote_number": "QX-77"}, pages, "m")
    assert ok and ok.total_cents == 3_800_000 and ok.parser == "llm:m" and ok.quote_number == "QX-77"
    assert Q.verify_llm_extraction({"total_amount_cents": 3_900_000}, pages, "m") is None  # fabricated
    assert Q.verify_llm_extraction({"total_amount_cents": "abc"}, pages, "m") is None
    ok2 = Q.verify_llm_extraction({"total_amount_cents": 3_800_000, "line_items": [
        {"description": "real", "amount_cents": 3_800_000, "page": 1}, {"description": "made up", "amount_cents": 123_400, "page": 1}]}, pages, "m")
    assert [i.description for i in ok2.line_items] == ["real"]


def test_contract_classification_and_party():
    lines = ["AIRCRAFT CHARTER AGREEMENT", "This agreement is made between the parties below.", "Terms and Conditions apply.",
             "Charterer: Jane Q. Member", "Governing law: State of Texas", "Signature: ____"]
    a = Q.analyze_pdf(make_pdf([lines]), "agreement.pdf")
    assert a.doc_type == Q.DOC_CONTRACT and a.extraction is None
    assert a.contracting_party == "Jane Q. Member"


def test_payment_link_from_pdf_annotation_and_body():
    pdf = make_pdf([QUOTE_LINES], links=[("Pay online", "https://pay.example.com/checkout/abc123")])
    a = Q.analyze_pdf(pdf, "q.pdf")
    assert "https://pay.example.com/checkout/abc123" in a.links
    link = Q.find_payment_link(a.pages, a.links)
    assert link.host == "pay.example.com" and link.url.endswith("abc123")
    body = "Thanks!\nYou can pay securely here: https://paynode.example.com/i/XYZ."
    link2 = Q.find_payment_link([body])
    assert link2.url == "https://paynode.example.com/i/XYZ" and link2.host == "paynode.example.com"


def test_payment_link_rejects_unsafe_and_unrelated_urls():
    assert Q.find_payment_link(["Visit https://www.operator.example.com for our fleet"]) is None
    assert Q.find_payment_link(["pay here http://pay.example.com/x"]) is None  # not https
    assert Q.find_payment_link(["pay here https://user:pw@pay.example.com/x"]) is None  # embedded credentials
    assert Q.find_payment_link(["no urls"]) is None


def test_document_classification_defaults_to_other():
    assert Q.classify_document(["Fuel receipt for last month"], "r.pdf") == Q.DOC_OTHER
