import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";
import { portalIdentity } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Your aviation workspace | EXJET", template: "%s | EXJET" }, description: "Plan aviation with EXJET. Search flights, explore empty legs and manage your personal travel workspace.", robots: { index: false, follow: false, googleBot: { index: false, follow: false } }, alternates: { canonical: "https://www.exjet.com/app/" } };
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const identity = await portalIdentity();
  let name: string | undefined;
  if (identity) {
    const { data } = await identity.client.from("portal_profiles").select("full_name").eq("user_id", identity.user.id).maybeSingle();
    name = data?.full_name?.split(" ")[0];
  }
  return <PortalShell signedIn={Boolean(identity)} name={name}>{children}</PortalShell>;
}
