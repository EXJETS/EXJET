"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Charter" },
  { href: "/search?category=empty-legs", label: "Empty Legs" },
  { href: "/membership", label: "Membership" },
  { href: "/aircraft-sales", label: "Aircraft Sales" },
  { href: "/dashboard", label: "My Trips" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#0a1628]">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* Triangle / mountain icon matching original EXJET */}
          <svg
            width="22"
            height="20"
            viewBox="0 0 22 20"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M11 1L21 19H1L11 1Z"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M11 7L16 19H6L11 7Z"
              fill="white"
              fillOpacity="0.35"
            />
          </svg>
          <span className="font-mono text-[15px] font-semibold tracking-[0.12em] text-white">
            EXJET
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[13px] text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
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
            className="text-[13px] font-medium text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center rounded-full bg-white px-5 py-2 text-[13px] font-medium text-[#0d1f3c] transition-colors hover:bg-[rgba(255,255,255,0.9)]"
          >
            Reserve
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          className="rounded-md p-2 text-[rgba(255,255,255,0.7)] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-[rgba(255,255,255,0.08)] transition-all duration-200 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-0.5 bg-[#0a1628] px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[14px] text-[rgba(255,255,255,0.65)] hover:bg-[rgba(255,255,255,0.07)] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 px-3 pt-3 pb-1">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-full border border-[rgba(255,255,255,0.2)] py-2.5 text-center text-[14px] font-medium text-white"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-full bg-white py-2.5 text-center text-[14px] font-medium text-[#0d1f3c]"
            >
              Reserve
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
