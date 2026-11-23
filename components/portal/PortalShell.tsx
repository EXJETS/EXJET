"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./Portal.module.css";

const workspaceLinks = [
  ["/app/", "Overview"], ["/app/trips/", "Saved trips"],
  ["/app/locations/", "Saved airports"], ["/app/alerts/", "Alerts"],
  ["/app/messages/", "Your advisor"], ["/app/settings/", "Settings"],
] as const;

export function PortalShell({ children, name, signedIn }: { children: React.ReactNode; name?: string; signedIn: boolean }) {
  const path = (usePathname() || "/app/").replace(/\/?$/, "/");
  const showWorkspaceNav = !["/app/login/", "/app/booking/"].includes(path);
  return <div className={styles.rentalWorkspace}>
    <SiteHeader />
    {showWorkspaceNav && <div className={styles.rentalTabs}><nav aria-label="Client workspace">
      {workspaceLinks.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>)}
      <Link href={signedIn ? "/app/settings/" : "/app/login/"}>{signedIn ? name || "Account" : "Sign in"}</Link>
    </nav></div>}
    <div className={styles.rentalContent}>{children}</div>
    <SiteFooter />
  </div>;
}
