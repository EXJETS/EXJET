"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff } from "lucide-react";
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

  const solid = scrolled || mobileOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-b border-black/5 bg-white/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            solid ? "text-neutral-900" : "text-white"
          )}
        >
          <PlaneTakeoff className="h-4 w-4" strokeWidth={2} />
          <span className="text-[15px] font-semibold tracking-[0.2em]">
            EXJET
            <span className={solid ? "text-neutral-400" : "text-white/50"}>
              .com
            </span>
          </span>
        </Link>

        {/* Desktop nav links — Apple-style small, evenly spaced */}
        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-[13px] font-normal transition-colors",
                  solid
                    ? "text-neutral-700 hover:text-neutral-950"
                    : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA — single pill */}
        <div className="hidden md:flex">
          <Link
            href="/search"
            className={cn(
              "inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              solid
                ? "bg-neutral-900 text-white hover:bg-neutral-700"
                : "bg-white text-neutral-900 hover:bg-white/90"
            )}
          >
            Reserve
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-md p-2 md:hidden transition-colors",
            solid ? "text-neutral-900" : "text-white"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-black/5 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 text-[15px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-full bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white"
          >
            Reserve
          </Link>
        </div>
      </div>
    </header>
  );
}
