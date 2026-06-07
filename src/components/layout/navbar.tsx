"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Charter" },
  { href: "/search?category=empty-legs", label: "Empty Legs" },
  { href: "/aircraft-sales", label: "Aircraft Sales" },
  { href: "/tracking", label: "Live Tracking" },
  { href: "/dashboard", label: "My Trips" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-neutral-100">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d1f3c]">
            <PlaneTakeoff className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="font-serif text-[20px] leading-none tracking-[0.06em] text-[var(--color-ink)]">
            EXJET
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
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
            className="text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center rounded-full bg-[#0d1f3c] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#1a3461] transition-colors"
          >
            Reserve
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          className="rounded-md p-2 text-neutral-600 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-neutral-100 transition-all duration-200 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 bg-white px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[14px] text-neutral-700 hover:bg-neutral-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 px-3 pt-2 pb-1">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-full border border-neutral-200 py-2.5 text-center text-[14px] font-medium text-neutral-700"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-full bg-[#0d1f3c] py-2.5 text-center text-[14px] font-medium text-white"
            >
              Reserve
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
