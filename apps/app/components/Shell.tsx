"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Building2, ListChecks, PlaneTakeoff, Send, UserRound, Plane } from "lucide-react";
import { useMe } from "@/hooks/me";
import { isMock } from "@/lib/api";
import { Chip, Skeleton } from "./ui";
import type { Me } from "@/lib/api";

// Mock tooling is only code-split in when NEXT_PUBLIC_API_MOCK=1 (inlined at build; dead code otherwise).
const MockSwitcher = process.env.NEXT_PUBLIC_API_MOCK === "1" ? dynamic(() => import("./MockSwitcher").then((m) => m.MockSwitcher), { ssr: false }) : null;

const BARE = ["/login", "/signup", "/legal"];
const PUBLIC = ["/aircraft", "/empty-legs"];
const isUnder = (p: string, base: string) => p === base || p.startsWith(base + "/");

const NAV = [
  { href: "/request", label: "Request", Icon: Send },
  { href: "/trips", label: "Trips", Icon: ListChecks },
  { href: "/empty-legs", label: "Empty legs", Icon: PlaneTakeoff },
  { href: "/aircraft", label: "Aircraft", Icon: Plane },
  { href: "/account", label: "Account", Icon: UserRound },
];

export function membershipChip(me: Me | null) {
  if (!me) return <Chip tone="neutral" plain>Visitor</Chip>;
  if (me.entitled) return <Chip tone="ok">Member{me.subscription ? ` · ${me.subscription.plan === "family_office" ? "Family Office" : me.subscription.plan === "enterprise" ? "Enterprise" : "Individual"}` : ""}</Chip>;
  const map: Record<string, [string, "wait" | "problem"]> = {
    kyc: ["Verification needed", "wait"],
    kyc_pending: ["Verification pending", "wait"],
    billing: ["Membership needed", "wait"],
  };
  const [t, tone] = map[me.next_step] ?? ["Not entitled", "wait"];
  return <Chip tone={me.account?.kyc_status === "rejected" ? "problem" : tone}>{me.account?.kyc_status === "rejected" ? "Verification declined" : t}</Chip>;
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { me, loading } = useMe();
  const bare = BARE.some((b) => isUnder(path, b));
  const isPublic = PUBLIC.some((b) => isUnder(path, b));
  const needsAuth = !bare && !isPublic;

  useEffect(() => {
    if (!loading && !me && needsAuth) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [loading, me, needsAuth, path, router]);

  if (bare) {
    return (
      <>
        {children}
        {MockSwitcher ? <MockSwitcher /> : null}
      </>
    );
  }

  const admin = me?.user.role === "admin";
  const items = admin ? [...NAV, { href: "/company", label: "Company", Icon: Building2 }] : NAV;

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <aside className="side" aria-label="Primary">
        <Link className="brand" href="/" aria-label="EXJET home">
          <Image src="/brand/exjet-wordmark.svg" alt="EXJET" width={104} height={28} priority unoptimized />
        </Link>
        <nav aria-label="Main">
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="navlink" aria-current={isUnder(path, href) ? "page" : undefined}>
              <Icon size={16} aria-hidden /> {label}
            </Link>
          ))}
          {admin ? (
            <div className="nav-group">
              <span className="eyebrow">Admin</span>
              <Link href="/company" className="navlink" aria-current={isUnder(path, "/company") ? "page" : undefined}>
                <Building2 size={16} aria-hidden /> Company
              </Link>
            </div>
          ) : null}
        </nav>
      </aside>
      <div className="main">
        <header className="top">
          <Link className="brand-m" href="/" aria-label="EXJET home">
            <Image src="/brand/exjet-wordmark.svg" alt="EXJET" width={80} height={22} priority unoptimized />
          </Link>
          <span className="eyebrow" aria-hidden style={{ display: "none" }} />
          <div style={{ flex: 1 }} />
          <div className="top-right">
            {isMock() ? <span className="mock-badge" role="status">MOCK DATA</span> : null}
            {loading ? <Skeleton h={22} w={120} /> : me ? (
              <>
                <Link href="/onboarding" style={{ textDecoration: "none" }} aria-label="Membership status">{membershipChip(me)}</Link>
                <Link href="/account" className="who" title={me.user.email}>{me.user.full_name}</Link>
              </>
            ) : (
              <>
                <Link className="btn btn-sm" href="/login">Sign in</Link>
                <Link className="btn btn-sm btn-primary" href="/signup">Create account</Link>
              </>
            )}
          </div>
        </header>
        <main id="main" className="content">
          {needsAuth && (loading || !me) ? <PageSkeleton /> : children}
        </main>
      </div>
      <nav className="tabbar" aria-label="Primary mobile">
        {items.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="tab" aria-current={isUnder(path, href) ? "page" : undefined}>
            <Icon size={20} aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {MockSwitcher ? <MockSwitcher /> : null}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" style={{ display: "grid", gap: 12 }}>
      <Skeleton h={28} w={220} />
      <Skeleton h={14} w={360} />
      <Skeleton h={180} />
    </div>
  );
}

