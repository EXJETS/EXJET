"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/me";
import { Banner } from "@/components/ui";

const TABS = [
  { href: "/company", label: "Overview" },
  { href: "/company/approvals", label: "Approvals" },
  { href: "/company/kyc", label: "KYC queue" },
  { href: "/company/quotes", label: "Quote review" },
  { href: "/company/operators", label: "Operators" },
  { href: "/company/quarantined", label: "Quarantined mail" },
  { href: "/company/suppressions", label: "Suppressions" },
  { href: "/company/inquiries", label: "Enterprise inquiries" },
  { href: "/company/data", label: "Data upload" },
  { href: "/company/jobs", label: "Jobs" },
  { href: "/company/agent-actions", label: "Agent actions" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { me } = useMe();
  if (me && me.user.role !== "admin") {
    return <Banner tone="problem" live>Company OS is for EXJET administrators.</Banner>;
  }
  return (
    <>
      <nav aria-label="Company sections" style={{ margin: "-8px 0 20px", overflowX: "auto" }}>
        <ul className="ul-plain" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line-strong)" }}>
          {TABS.map((t) => {
            const on = t.href === "/company" ? path === "/company" : path.startsWith(t.href);
            return (
              <li key={t.href} style={{ padding: 0, border: 0 }}>
                <Link href={t.href} aria-current={on ? "page" : undefined} style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "0 12px", textDecoration: "none", whiteSpace: "nowrap", color: on ? "var(--ink)" : "var(--gray)", fontWeight: on ? 500 : 400, boxShadow: on ? "inset 0 -2px 0 var(--ink)" : undefined }}>{t.label}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </>
  );
}
