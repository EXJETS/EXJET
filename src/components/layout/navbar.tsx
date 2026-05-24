"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Fleet" },
  { href: "/empty-legs", label: "Empty Legs" },
  { href: "/tracking", label: "Live" },
  { href: "/dashboard", label: "Trips" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a1628]">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-[22px] font-bold uppercase tracking-[0.18em] text-white"
        >
          EXJET
        </Link>

        {/* Desktop nav links — center */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60 transition-colors hover:text-white"
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
            className="rounded border border-white/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/search"
            className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#07101e] transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#c4a052" }}
          >
            Reserve Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded p-2 text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/10 transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 bg-[#0a1628] px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded px-3 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 pb-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded border border-white/30 px-4 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[#07101e]"
              style={{ backgroundColor: "#c4a052" }}
            >
              Reserve Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
