"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Browse Fleet" },
  { href: "/empty-legs", label: "Empty Legs" },
  { href: "/tracking", label: "Live Tracking" },
  { href: "/dashboard", label: "My Trips" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#07101e]/10 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-[21px] font-bold uppercase tracking-[0.18em] text-[#07101e]"
        >
          EXJET
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/55 transition-colors hover:text-[#07101e]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="rounded-lg border border-[#07101e]/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#07101e]/70 transition-colors hover:border-[#07101e] hover:text-[#07101e]"
          >
            Sign In
          </Link>
          <Link
            href="/search"
            className="rounded-lg bg-[#07101e] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85"
          >
            Reserve Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#07101e] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-[#07101e]/08 bg-white transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-0.5 px-5 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-[#07101e]/60 transition-colors hover:bg-[#f7f8fa] hover:text-[#07101e]"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 pb-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg border border-[#07101e]/15 px-4 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[#07101e]/70"
            >
              Sign In
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-[#07101e] px-4 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-white"
            >
              Reserve Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
