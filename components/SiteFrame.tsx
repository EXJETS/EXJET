"use client";
import { usePathname } from "next/navigation";
import { BrokerNotice } from "@/components/BrokerNotice";
export function SiteFrame({ children, header, footer }: { children: React.ReactNode; header: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const application = pathname === "/app" || pathname.startsWith("/app/");
  return <>{!application && header}<main id="main-content" className={application ? "ex-application" : "ex-public"} tabIndex={-1}>{!application && <BrokerNotice prominent />}{children}</main>{!application && footer}</>;
}
