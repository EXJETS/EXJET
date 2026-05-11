import Link from "next/link";
import {
  PlaneTakeoff,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  ArrowUpRight,
} from "lucide-react";

const columns = [
  {
    title: "Book",
    links: [
      { label: "Charter a Jet", href: "/search" },
      { label: "Empty Legs", href: "/search?mode=empty" },
      { label: "Browse Fleet", href: "/jets" },
      { label: "Live Tracking", href: "/tracking" },
    ],
  },
  {
    title: "Ground",
    links: [
      { label: "Book a Ride", href: "/ground/book" },
      { label: "Vehicle Fleet", href: "/ground/fleet" },
      { label: "Track My Ride", href: "/ground/tracking" },
      { label: "Chauffeur Portal", href: "/ground/chauffeur" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "FAQ", href: "/faq" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Refunds", href: "/refunds" },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] text-[var(--color-ink-soft)]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        {/* Editorial top — large wordmark + tagline */}
        <div className="border-b border-[var(--color-hairline)] pb-14">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                EXJET · Global Access, On-Demand.
              </span>
              <h2 className="mt-5 font-serif text-[44px] leading-[1.05] text-[var(--color-ink)] sm:text-[56px]">
                The world,
                <br />
                <em className="italic font-normal text-[var(--color-muted)]">
                  one cabin away.
                </em>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] bg-transparent text-[var(--color-ink-soft)] transition-colors hover:border-champagne hover:text-champagne"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 pt-14 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-baseline gap-2">
              <PlaneTakeoff
                className="h-3.5 w-3.5 text-champagne"
                strokeWidth={1.75}
              />
              <span className="font-serif text-[22px] tracking-[0.06em] text-[var(--color-ink)]">
                EXJET
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-[13px] leading-[1.8] text-[var(--color-muted)]">
              An invitation to travel without compromise. Curated worldwide
              fleet. 24/7 concierge. Confirmed in under four hours.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-[13px] text-[var(--color-ink-soft)] transition-colors hover:text-champagne"
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
            © {new Date().getFullYear()} EXJET · All rights reserved.
          </p>
          <p className="font-mono uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            ARGUS Platinum · Wyvern Wingman
          </p>
        </div>
      </div>
    </footer>
  );
}
