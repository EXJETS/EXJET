"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Cabin Systems",
    href: "/cabin-comfort-systems",
    children: [
      { label: "Aircraft Insulation Basics", href: "/cabin-comfort-systems/aircraft-insulation-basics" },
      { label: "Performance History", href: "/performance-history" },
      { label: "Acoustic Testing", href: "/cabin-comfort-systems/acoustic-testing" },
      { label: "Insulation Product List", href: "/cabin-comfort-systems/insulation-products" },
      { label: "Replacement Parts", href: "/cabin-comfort-systems/replacement-parts" },
    ],
  },
  {
    label: "Mission Interiors",
    href: "/special-mission-interiors",
    children: [
      { label: "ISR", href: "/special-mission-interiors/isr" },
      { label: "Interior Treatments", href: "/special-mission-interiors/interior-treatments" },
      { label: "Upholstery", href: "/special-mission-interiors/upholstery" },
      { label: "Med-Evac", href: "/special-mission-interiors/med-evac" },
      { label: "ADMI Replacement Parts", href: "/special-mission-interiors/replacement-parts" },
    ],
  },
  {
    label: "VIP Interiors",
    href: "/vip-interiors",
    children: null,
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Team", href: "/about/team" },
      { label: "News", href: "/news" },
      { label: "Blog", href: "/blog" },
      { label: "Downloads & STCs", href: "/about/downloads" },
      { label: "Government Page", href: "/about/government" },
    ],
  },
];

function DropdownMenu({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.14)]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-5 py-3 text-[13px] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)]"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function NavItem({
  item,
}: {
  item: (typeof navItems)[number];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <DropdownMenu items={item.children} />
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
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
          ? "border-b border-[var(--color-hairline)] bg-white/90 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-[var(--color-ink)]"
        >
          {/* Luminary aircraft mark — simplified SVG */}
          <svg
            width="38"
            height="24"
            viewBox="0 0 38 24"
            fill="none"
            aria-hidden
            className="shrink-0"
          >
            {/* Aircraft body */}
            <path
              d="M2 14 L22 4 L36 8 L22 10 L28 20 L18 16 L8 20 Z"
              fill="#1a1a1a"
              opacity="0.85"
            />
            {/* Lime accent streak */}
            <path
              d="M4 13.5 L34 7.5"
              stroke="#b5b400"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col leading-none">
            <span className="font-serif text-[20px] tracking-[0.04em] text-[var(--color-ink)]">
              Lu·mi·nar·y
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--color-subtle)]">
              Air Group
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2 text-[11px] font-medium text-white transition-all hover:bg-[var(--color-lime)]"
          >
            <span className="font-mono uppercase tracking-[0.18em]">Get a Quote</span>
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-[var(--color-ink)] lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-t border-[var(--color-hairline)] transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-[80vh] overflow-y-auto" : "max-h-0"
        )}
      >
        <div className="space-y-0 px-5 py-4">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSection(
                        mobileSection === item.label ? null : item.label
                      )
                    }
                    className="flex w-full items-center justify-between px-0 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink)]"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-[var(--color-subtle)] transition-transform",
                        mobileSection === item.label && "rotate-180"
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  {mobileSection === item.label && (
                    <div className="mb-2 ml-4 border-l border-[var(--color-hairline)] pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2.5 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="border-t border-[var(--color-hairline)] pt-4">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-full bg-[var(--color-ink)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
