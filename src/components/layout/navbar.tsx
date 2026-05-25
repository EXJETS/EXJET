"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff, ChevronDown, Phone, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

const bookSubNav = [
  { label: "One Way Charter", href: "/search?trip=one_way" },
  { label: "Round Trip Charter", href: "/search?trip=round_trip" },
  { label: "Multi-Leg Charter", href: "/search?trip=multi_leg" },
  { label: "Empty Legs", href: "/search?mode=empty" },
  { label: "Group Charter", href: "/search?group=true" },
];

const mainNav = [
  { label: "Book Charter", href: "/search", sub: bookSubNav },
  { label: "My Trips", href: "/dashboard" },
  { label: "Fleet", href: "/search" },
  { label: "Travel Info", href: "#travel-info" },
  { label: "EXJET Miles", href: "#miles" },
  { label: "Need Help?", href: "/auth/login", icon: Phone },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-[0_1px_0_0_rgba(15,35,65,0.1)]">
      {/* ── Utility bar (Delta-style top strip) ── */}
      <div className="bg-[var(--color-navy)] text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-champagne" strokeWidth={1.75} />
            <span className="text-[11px] text-white/70">
              EXJET Miles — Earn 1 mile per dollar.{" "}
              <Link
                href="/auth/register"
                className="text-champagne underline-offset-2 hover:underline"
              >
                Join free
              </Link>
            </span>
          </div>
          <div className="hidden items-center divide-x divide-white/20 sm:flex">
            <a
              href="tel:+18003935387"
              className="flex items-center gap-1.5 px-4 text-[11px] text-white/65 transition-colors hover:text-white"
            >
              <Phone className="h-3 w-3" strokeWidth={1.75} />
              1-800-EXJET
            </a>
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 pl-4 text-[11px] text-white/65 transition-colors hover:text-white"
            >
              <User className="h-3 w-3" strokeWidth={1.75} />
              Sign In / Join
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main navigation (always white — Delta-style) ── */}
      <nav className="bg-white">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-navy)] transition-colors group-hover:bg-champagne">
              <PlaneTakeoff className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-serif text-[20px] leading-none tracking-wide text-[var(--color-navy)]">
              EXJET
            </span>
          </Link>

          {/* Desktop nav tabs */}
          <ul className="hidden h-full items-center lg:flex">
            {mainNav.map((item) =>
              item.sub ? (
                <li
                  key={item.label}
                  ref={dropdownRef}
                  className="relative h-full flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    className={cn(
                      "flex h-full items-center gap-1 border-b-2 px-4 text-[13px] font-medium transition-colors",
                      dropdownOpen
                        ? "border-champagne text-[var(--color-navy)]"
                        : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-navy-light)] hover:text-[var(--color-navy)]"
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")}
                      strokeWidth={2}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 top-full z-50 min-w-[200px] overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-white shadow-xl">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={() => setDropdownOpen(false)}
                          className="block border-b border-gray-100 px-5 py-3 text-[13px] text-[var(--color-muted)] last:border-0 hover:bg-[var(--color-navy-light)] hover:text-[var(--color-navy)]"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={item.label} className="h-full flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-full items-center gap-1.5 border-b-2 border-transparent px-4 text-[13px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-navy-light)] hover:text-[var(--color-navy)]",
                      item.icon && "gap-1.5"
                    )}
                  >
                    {item.icon && <item.icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* CTA */}
          <div className="hidden shrink-0 lg:block">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-md bg-champagne px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-navy)]"
            >
              Reserve a Jet
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="p-2 text-[var(--color-navy)] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-200 bg-white transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-[560px]" : "max-h-0"
        )}
      >
        <div className="divide-y divide-gray-100 pb-4">
          {mainNav.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-5 py-3.5 text-[14px] font-medium text-[var(--color-navy)] hover:bg-[var(--color-navy-light)]"
              >
                {item.icon && <item.icon className="h-4 w-4" strokeWidth={1.75} />}
                {item.label}
              </Link>
              {item.sub && (
                <div className="bg-gray-50">
                  {item.sub.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-8 py-2.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-navy)]"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="px-5 pt-3">
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-md bg-champagne py-3 text-[14px] font-semibold text-white"
            >
              Reserve a Jet
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
