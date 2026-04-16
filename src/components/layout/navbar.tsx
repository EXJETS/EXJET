"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Fleet" },
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
          ? "border-b border-neutral-200 bg-white/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Wordmark — Vercel-style tight, Geist sans */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-neutral-950"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 bg-neutral-50 transition-colors group-hover:bg-neutral-100">
            <PlaneTakeoff className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="text-[14px] font-semibold tracking-[0.16em]">
            EXJET
            <span className="text-neutral-400">.com</span>
          </span>
        </Link>

        {/* Desktop nav — small, monospace-caps look */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[13px] text-neutral-600 transition-colors hover:text-neutral-950"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA — Vercel pill with arrow */}
        <div className="hidden md:flex">
          <Link
            href="/search"
            className="group inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-1.5 text-[13px] font-medium text-neutral-950 transition-colors hover:bg-neutral-800"
          >
            Reserve
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-neutral-950 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-t border-neutral-200 transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 text-[15px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-neutral-950"
          >
            Reserve
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </header>
  );
}
