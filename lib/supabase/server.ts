import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { portalConfigured } from "@/lib/portal/config";

export async function createPortalClient() {
  if (!portalConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { sameSite: "lax", secure: process.env.NODE_ENV === "production", httpOnly: true, path: "/app" },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot write cookies. The /app proxy refreshes them. */ }
      },
    },
  });
}

export async function portalIdentity() {
  const client = await createPortalClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email_confirmed_at || data.user.is_anonymous) return null;
  return { client, user: data.user };
}
