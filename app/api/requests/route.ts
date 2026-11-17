import { fieldsFromForm, submitInquiry, type InquiryIntent } from "@/lib/inquiries";
import { conversionEvent } from "@/lib/inquiry-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function wantsHtml(request: Request, contentType: string) {
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html") && !accept.includes("application/json");
}

function htmlRedirect(request: Request, intent: InquiryIntent | undefined, result: { ok: true; reference: string } | { ok: false; status: number }) {
  const url = new URL("/request-received/", request.url);
  url.searchParams.set("kind", intent ? conversionEvent(intent) : "quote_request");
  if (result.ok) url.searchParams.set("ref", result.reference);
  else url.searchParams.set("error", result.status === 429 ? "rate" : result.status === 503 ? "delivery" : "review");
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const html = wantsHtml(request, contentType);
  let value: unknown;
  try {
    if (contentType.includes("application/json")) {
      const raw = await request.text();
      if (raw.length > 24_000) {
        return html
          ? htmlRedirect(request, undefined, { ok: false, status: 413 })
          : Response.json({ error: "Request is too large." }, { status: 413 });
      }
      value = JSON.parse(raw);
    } else {
      value = fieldsFromForm(await request.formData());
    }
  } catch {
    return html
      ? htmlRedirect(request, undefined, { ok: false, status: 400 })
      : Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const intent = value && typeof value === "object" ? (value as { intent?: InquiryIntent; mode?: InquiryIntent }).intent || (value as { mode?: InquiryIntent }).mode : undefined;
  const result = await submitInquiry(request, value);
  if (html) return htmlRedirect(request, result.ok ? result.intent : intent, result.ok ? { ok: true, reference: result.reference } : { ok: false, status: result.status });
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ ok: true, reference: result.reference }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
