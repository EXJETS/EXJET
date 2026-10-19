import { readObject, intakeError, createRateLimit } from "@/lib/request";
import { createAvinodeEmptyLegLead, avinodeStatus } from "@/integration/avinode/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const throttled = createRateLimit(12);

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (throttled(request)) return Response.json({ error: "Too many requests. Please try again later or contact EXJET." }, { status: 429, headers: { "Retry-After": "600", "Cache-Control": "no-store" } });
  if (!avinodeStatus().enabled) return Response.json({ error: "Online availability is unavailable. Please call or email EXJET for current options." }, { status: 503 });
  let raw: Record<string, unknown>;
  try { raw = await readObject(request); } catch (error) { return intakeError(error); }

  const searchId = clean(raw.searchId, 80);
  const emptyLegId = clean(raw.emptyLegId, 80);
  const name = clean(raw.name, 100);
  const email = clean(raw.email, 180).toLowerCase();
  const phone = clean(raw.phone, 40);
  const notes = clean(raw.notes, 2_500);
  if (!searchId || !emptyLegId || name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 7) {
    return Response.json({ error: "Please review your contact details." }, { status: 400 });
  }

  const reference = `EXJ-EL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    await createAvinodeEmptyLegLead({
      searchId,
      emptyLegId,
      contact: { name, email, phone },
      notes: notes || undefined,
      clientIdentifier: reference,
      domainName: "exjet.com",
    });
    return Response.json({ ok: true, reference }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[avinode] Empty-leg lead failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "This request could not be sent. Please call EXJET for immediate assistance." }, { status: 502 });
  }
}
