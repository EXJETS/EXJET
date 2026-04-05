"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Plane, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/search", label: "Fleet" },
  { href: "/services/charter", label: "Charter" },
  { href: "/services/empty-legs", label: "Empty Legs" },
  { href: "/tracking", label: "Tracking" },
  { href: "/dashboard", label: "My Trips" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-navy-800/50 bg-navy-950/90 backdrop-blur-xl shadow-lg shadow-navy-950/20"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white transition-transform duration-300 group-hover:scale-105">
            <Plane className="h-4.5 w-4.5 text-navy-900" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            EXJET
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition-all hover:bg-white/90 hover:shadow-md active:scale-[0.97]"
          >
            Book a Flight
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out lg:hidden",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 border-t border-white/10 bg-navy-950/95 backdrop-blur-xl px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold text-navy-900 shadow-sm"
          >
            Book a Flight
          </Link>
        </div>
      </div>
    </header>
  );
}
