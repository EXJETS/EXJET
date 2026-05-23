import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const columns = [
  {
    title: "Cabin Systems",
    links: [
      { label: "Acoustic Engineering", href: "/cabin-comfort-systems" },
      { label: "Insulation Products", href: "/cabin-comfort-systems/insulation-products" },
      { label: "Insulation Basics", href: "/cabin-comfort-systems/aircraft-insulation-basics" },
      { label: "Acoustic Testing", href: "/cabin-comfort-systems/acoustic-testing" },
      { label: "Replacement Parts", href: "/cabin-comfort-systems/replacement-parts" },
    ],
  },
  {
    title: "Mission Interiors",
    links: [
      { label: "ADMI™ Platform", href: "/special-mission-interiors" },
      { label: "ISR Configurations", href: "/special-mission-interiors/isr" },
      { label: "Medical Evacuation", href: "/special-mission-interiors/med-evac" },
      { label: "Interior Treatments", href: "/special-mission-interiors/interior-treatments" },
      { label: "Replacement Parts", href: "/special-mission-interiors/replacement-parts" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "VIP Completions", href: "/vip-interiors" },
      { label: "Performance Record", href: "/performance-history" },
      { label: "About Luminary", href: "/about" },
      { label: "Our Team", href: "/about/team" },
      { label: "Government", href: "/about/government" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Downloads & STCs", href: "/about/downloads" },
      { label: "Blog & Technical Articles", href: "/blog" },
      { label: "News", href: "/news" },
      { label: "New Customer Enquiry", href: "/contact" },
      { label: "Shop", href: "/shop" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#f4f3f0]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">

        {/* ── Top bar ── */}
        <div className="mb-14 flex flex-col items-start justify-between gap-8 border-b border-black/[0.06] pb-14 lg:flex-row lg:items-end">
          {/* Brand + tagline */}
          <div>
            <div className="flex items-center gap-2.5">
              <svg width="28" height="18" viewBox="0 0 38 24" fill="none" aria-hidden>
                <path d="M2 14 L22 4 L36 8 L22 10 L28 20 L18 16 L8 20 Z" fill="#111111" opacity="0.65" />
                <path d="M4 13.5 L34 7.5" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-serif text-[17px] tracking-[0.04em] text-[#111111]">Lu·mi·nar·y</span>
            </div>
            <h2 className="mt-5 font-serif text-[38px] leading-[1.05] text-[#111111] sm:text-[46px]">
              Experienced.
              <br />
              <em className="font-normal italic text-[#bbbbbb]">Reliable. Certified.</em>
            </h2>
            <p className="mt-4 max-w-sm text-[13px] leading-[1.8] text-[#888888]">
              FAA Part 21 manufacturer of aircraft interior systems. Acoustic insulation,
              special mission platforms, and VIP completions — with published performance data.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <a
              href="mailto:info@luminary.aero"
              className="inline-flex items-center gap-2.5 text-[13px] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              info@luminary.aero
            </a>
            <a
              href="tel:+18886242400"
              className="inline-flex items-center gap-2.5 text-[13px] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              1-888-624-2400
            </a>
            <div className="mt-2 flex flex-wrap gap-2">
              {["FAA Part 21", "EASA", "AS9100D", "ADMI™"].map((c) => (
                <span key={c} className="rounded-full border border-black/[0.1] bg-white px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-gold)]">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#888888] transition-colors hover:text-[var(--color-gold)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-black/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#cccccc]">
            &copy; {new Date().getFullYear()} Luminary Air Group &middot; All rights reserved
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#cccccc]">
            Part 21 Manufacturer &middot; ADMI™ Platform &middot; luminary.aero
          </p>
        </div>
      </div>
    </footer>
  );
}
