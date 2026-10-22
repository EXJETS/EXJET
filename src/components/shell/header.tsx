"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";
import { useHydrated, useSession } from "@/store/app-store";
import { Logo } from "@/components/shell/logo";

const links = [
  { href: "/charter/", label: "Charter" },
  { href: "/empty-legs/", label: "Empty legs" },
  { href: "/trips/", label: "Trips" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const user = useSession();
  const ready = useHydrated();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over the dark home hero the bar starts transparent with light text.
  const onDark = pathname === "/" && !scrolled;
  const consoleLink =
    user?.role === "operator" ? { href: "/operator/", label: "Operator" } : user?.role === "admin" ? { href: "/admin/", label: "Admin" } : null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-colors",
        scrolled ? "border-b border-line bg-canvas/85 backdrop-blur-xl" : "bg-canvas/0",
        onDark ? "text-white" : "text-ink"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" aria-label="EXJET home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[...links, ...(consoleLink ? [consoleLink] : [])].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-2 text-[14px] transition",
                pathname.startsWith(l.href.slice(0, -1))
                  ? "bg-black/5 text-ink"
                  : onDark
                    ? "text-white/70 hover:text-white"
                    : "text-muted hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/account/"
          className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-3.5 text-[13px] font-medium text-ink"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
            {ready && user ? initials(user.name) : "•"}
          </span>
          <span className="max-w-[9rem] truncate">{ready && user ? user.name.split(" ")[0] : "Sign in"}</span>
        </Link>
      </div>
    </header>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
