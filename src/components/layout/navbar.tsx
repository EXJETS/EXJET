"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Fleet" },
  { href: "/empty-legs", label: "Empty Legs" },
  { href: "/tracking", label: "Live" },
  { href: "/dashboard", label: "Trips" },
  { href: "/auth/login", label: "Account" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "border-b border-[var(--color-hairline)] bg-[var(--color-ivory)]/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Wordmark — editorial serif */}
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 text-[var(--color-ink)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] bg-transparent transition-colors group-hover:border-champagne">
            <PlaneTakeoff
              className="h-3 w-3 text-[var(--color-ink)] transition-colors group-hover:text-champagne"
              strokeWidth={1.75}
            />
          </span>
          <span className="font-serif text-[22px] leading-none tracking-[0.06em]">
            EXJET
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            est.
          </span>
        </Link>

        {/* Desktop nav — uppercase mono */}
        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA — premium ink pill */}
        <div className="hidden md:flex">
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2 text-[12px] font-medium text-white transition-all hover:bg-champagne"
          >
            <span className="font-mono uppercase tracking-[0.18em]">Reserve</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-[var(--color-ink)] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-t border-[var(--color-hairline)] transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ivory-deep)] hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-white"
          >
            Reserve
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
