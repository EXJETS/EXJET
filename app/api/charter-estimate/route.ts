import { calculateCharterEstimate } from "./estimate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const text = await request.text();
    if (text.length > 12_000) return Response.json({
      estimateUsd: null, segments: [], currency: "USD", reason: "This estimate request is too large.",
    }, { status: 413, headers });
    return Response.json(calculateCharterEstimate(JSON.parse(text)), { headers });
  } catch {
    return Response.json({
      estimateUsd: null, segments: [], currency: "USD", reason: "This estimate request could not be read.",
    }, { status: 400, headers });
  }
}
