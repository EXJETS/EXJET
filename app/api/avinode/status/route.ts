import { avinodeStatus } from "@/integration/avinode/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = avinodeStatus();
  return Response.json(
    { enabled: status.enabled, configured: status.configured, mode: status.mode },
    { headers: { "Cache-Control": "no-store" } },
  );
}
