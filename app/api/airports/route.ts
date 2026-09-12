import { avinodeStatus, searchAvinodeAirports } from "@/integration/avinode/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const status = avinodeStatus();
  const filter = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (!status.enabled || filter.length < 2) {
    return Response.json({ items: [], enabled: status.enabled }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const items = await searchAvinodeAirports(filter);
    return Response.json({ items, enabled: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ items: [], enabled: true }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
