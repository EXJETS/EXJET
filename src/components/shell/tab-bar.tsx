"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, Plane, Tag, UserRound } from "lucide-react";
import { cn } from "@/lib/format";

const tabs = [
  { href: "/", label: "Home", icon: Home, active: (p: string) => p === "/" },
  { href: "/charter/", label: "Charter", icon: Plane, active: (p: string) => p.startsWith("/charter") },
  { href: "/empty-legs/", label: "Empty Legs", icon: Tag, active: (p: string) => p.startsWith("/empty-legs") || p.startsWith("/alerts") },
  { href: "/trips/", label: "Trips", icon: Briefcase, active: (p: string) => p.startsWith("/trips") },
  { href: "/account/", label: "Account", icon: UserRound, active: (p: string) => p.startsWith("/account") || p.startsWith("/operator") || p.startsWith("/admin") },
];

/** iOS-style bottom navigation on phones (and in the native shell). Hidden from md up. */
export function TabBar() {
  const pathname = usePathname() ?? "/";
  return (
    <>
      <div aria-hidden className="h-[calc(64px+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid h-16 grid-cols-5">
          {tabs.map((t) => {
            const on = t.active(pathname);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[10.5px] font-medium",
                    on ? "text-ink" : "text-subtle"
                  )}
                >
                  <t.icon className={cn("h-[22px] w-[22px]", on && "text-gold")} strokeWidth={on ? 2.1 : 1.7} />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
