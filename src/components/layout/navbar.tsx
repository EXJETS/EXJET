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
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-neutral-100">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
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
              stroke="#0d1f3c"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M11 7L16 19H6L11 7Z"
              fill="#0d1f3c"
              fillOpacity="0.4"
            />
          </svg>
          <span className="font-mono text-[15px] font-semibold tracking-[0.12em] text-[#0d1f3c]">
            EXJET
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[13px] text-neutral-500 transition-colors hover:text-[#0a1628]"
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
            className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-[#0a1628]"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center rounded-full bg-[#0d1f3c] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461]"
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
        <div className="space-y-0.5 bg-white px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[14px] text-neutral-600 hover:bg-neutral-50 hover:text-[#0a1628]"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 px-3 pt-3 pb-1">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-full border border-neutral-300 py-2.5 text-center text-[14px] font-medium text-[#0a1628]"
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
