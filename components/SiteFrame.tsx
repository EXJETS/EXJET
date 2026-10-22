"use client";
import { usePathname } from "next/navigation";
export function SiteFrame({ children, header, footer }: { children: React.ReactNode; header: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const application = pathname === "/app" || pathname.startsWith("/app/");
  return <>{!application && header}<main id="main-content" tabIndex={-1}>{children}</main>{!application && footer}</>;
}
