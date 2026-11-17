import { createAvinodeEmptyLegLead, avinodeStatus } from "@/integration/avinode/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!avinodeStatus().enabled) return Response.json({ error: "Live availability is not configured." }, { status: 503 });
  let raw: Record<string, unknown>;
  try {
    raw = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

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
