import { NextResponse } from "next/server";
import { createPortalClient } from "@/lib/supabase/server";
import { portalOrigin, safeReturnPath } from "@/lib/portal/config";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const client = await createPortalClient();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeReturnPath(params.get("next")), portalOrigin()), { headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.redirect(new URL("/app/login/?error=expired", portalOrigin()), { headers: { "Cache-Control": "private, no-store" } });
}
