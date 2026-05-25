"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff, ArrowRight, Phone, Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavLinks = [
  {
    href: "/search",
    label: "Book Charter",
    sub: [
      { label: "One Way", href: "/search?trip=one_way" },
      { label: "Round Trip", href: "/search?trip=round_trip" },
      { label: "Multi-Leg", href: "/search?trip=multi_leg" },
      { label: "Empty Legs", href: "/search?mode=empty" },
      { label: "Group Charter", href: "/search?group=true" },
    ],
  },
  { href: "/dashboard", label: "My Trips" },
  { href: "/search", label: "Fleet" },
  { href: "/tracking", label: "Live Tracking" },
  { href: "#miles", label: "EXJET Miles" },
  { href: "/auth/login", label: "Concierge" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !scrolled && !mobileOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Utility bar */}
      <div
        className={cn(
          "overflow-hidden bg-[var(--color-ink)] transition-all duration-300",
          scrolled ? "max-h-0" : "max-h-10"
        )}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-champagne" strokeWidth={1.75} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
              EXJET Miles&nbsp;·&nbsp;Earn 1 mile per dollar chartered&nbsp;·&nbsp;
              <Link href="/auth/register" className="text-champagne underline-offset-2 hover:underline">
                Join free
              </Link>
            </span>
          </div>
          <div className="hidden items-center gap-5 sm:flex">
            <a
              href="tel:+18003935387"
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
            >
              <Phone className="h-2.5 w-2.5" strokeWidth={1.75} />
              24/7 Concierge
            </a>
            <Link
              href="/auth/login"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div
        className={cn(
          "transition-all duration-300",
          scrolled || mobileOpen
            ? "border-b border-[var(--color-hairline)] bg-[var(--color-ivory)]/95 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Wordmark */}
          <Link href="/" className="group flex items-baseline gap-2.5">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border transition-colors group-hover:border-champagne",
                light ? "border-white/30" : "border-[var(--color-hairline-strong)]"
              )}
            >
              <PlaneTakeoff
                className={cn(
                  "h-3 w-3 transition-colors group-hover:text-champagne",
                  light ? "text-white" : "text-[var(--color-ink)]"
                )}
                strokeWidth={1.75}
              />
            </span>
            <span
              className={cn(
                "font-serif text-[22px] leading-none tracking-[0.06em] transition-colors",
                light ? "text-white" : "text-[var(--color-ink)]"
              )}
            >
              EXJET
            </span>
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
                light ? "text-white/45" : "text-[var(--color-subtle)]"
              )}
            >
              est.
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-7 lg:flex">
            {mainNavLinks.map((link) =>
              link.sub ? (
                <li key={link.href} className="relative">
                  <button
                    type="button"
                    onClick={() => setBookOpen((o) => !o)}
                    onBlur={() => setTimeout(() => setBookOpen(false), 150)}
                    className={cn(
                      "flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
                      light
                        ? "text-white/70 hover:text-white"
                        : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn("h-3 w-3 transition-transform", bookOpen && "rotate-180")}
                      strokeWidth={2}
                    />
                  </button>
                  {bookOpen && (
                    <div className="absolute left-0 top-full mt-3 min-w-[180px] overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]">
                      {link.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={() => setBookOpen(false)}
                          className="block px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)]"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
                      light
                        ? "text-white/70 hover:text-white"
                        : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* Reserve CTA */}
          <div className="hidden lg:flex">
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2 text-[12px] font-medium text-white transition-all hover:bg-[var(--color-ink)]"
            >
              <span className="font-mono uppercase tracking-[0.18em]">Reserve</span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2 transition-colors lg:hidden",
              light ? "text-white" : "text-[var(--color-ink)]"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-[var(--color-hairline)] bg-[var(--color-ivory)]/95 backdrop-blur-xl transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-[560px] border-b" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-5 py-4">
          {mainNavLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ivory-deep)] hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
              {link.sub && (
                <div className="ml-4 space-y-0.5">
                  {link.sub.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-ivory-deep)]"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="space-y-2 pt-2">
            <a
              href="tel:+18003935387"
              className="flex items-center gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
              24/7 Concierge
            </a>
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-champagne px-5 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-white"
            >
              Reserve Now
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
