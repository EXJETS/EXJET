import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";

const columns = [
  {
    title: "Cabin Systems",
    links: [
      { label: "Aircraft Insulation Basics", href: "/cabin-comfort-systems/aircraft-insulation-basics" },
      { label: "Performance History", href: "/performance-history" },
      { label: "Acoustic Testing", href: "/cabin-comfort-systems/acoustic-testing" },
      { label: "Insulation Products", href: "/cabin-comfort-systems/insulation-products" },
      { label: "Replacement Parts", href: "/cabin-comfort-systems/replacement-parts" },
    ],
  },
  {
    title: "Mission Interiors",
    links: [
      { label: "ISR", href: "/special-mission-interiors/isr" },
      { label: "Interior Treatments", href: "/special-mission-interiors/interior-treatments" },
      { label: "Upholstery", href: "/special-mission-interiors/upholstery" },
      { label: "Med-Evac", href: "/special-mission-interiors/med-evac" },
      { label: "ADMI Replacement Parts", href: "/special-mission-interiors/replacement-parts" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "VIP Interiors", href: "/vip-interiors" },
      { label: "Our Team", href: "/about/team" },
      { label: "News", href: "/news" },
      { label: "Blog", href: "/blog" },
      { label: "Government Page", href: "/about/government" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Downloads & STCs", href: "/about/downloads" },
      { label: "New Customer Form", href: "/contact" },
      { label: "Shop", href: "/shop" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] text-[var(--color-ink-soft)]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        {/* Editorial top */}
        <div className="border-b border-[var(--color-hairline)] pb-14">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                Luminary Air Group · Est. 1999
              </span>
              <h2 className="mt-5 font-serif text-[44px] leading-[1.05] text-[var(--color-ink)] sm:text-[56px]">
                Experienced.
                <br />
                <em className="font-normal italic text-[var(--color-muted)]">
                  Reliable. Flexible.
                </em>
              </h2>
            </div>
            <div className="flex flex-col gap-3 text-[13px] text-[var(--color-muted)]">
              <a
                href="mailto:info@luminary.aero"
                className="group inline-flex items-center gap-2 transition-colors hover:text-[var(--color-lime)]"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                info@luminary.aero
              </a>
              <a
                href="tel:+1-800-000-0000"
                className="group inline-flex items-center gap-2 transition-colors hover:text-[var(--color-lime)]"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                +1 (800) 000-0000
              </a>
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 pt-14 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            {/* Logo mark */}
            <div className="flex items-center gap-2.5">
              <svg width="32" height="20" viewBox="0 0 38 24" fill="none" aria-hidden>
                <path
                  d="M2 14 L22 4 L36 8 L22 10 L28 20 L18 16 L8 20 Z"
                  fill="#1a1a1a"
                  opacity="0.7"
                />
                <path
                  d="M4 13.5 L34 7.5"
                  stroke="#b5b400"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-serif text-[18px] tracking-[0.04em] text-[var(--color-ink)]">
                Lu·mi·nar·y
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[13px] leading-[1.8] text-[var(--color-muted)]">
              Aircraft interior design, manufacturing, and installation. Cabin
              insulation, special mission platforms, and VIP completions.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
              Part 21 Manufacturer
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-[13px] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-lime)]"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-hairline)] pt-8 text-[12px] sm:flex-row sm:items-center">
          <p className="font-mono uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            © {new Date().getFullYear()} Luminary Air Group · All rights reserved.
          </p>
          <p className="font-mono uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            Part 21 Manufacturer · ADMI™ Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
