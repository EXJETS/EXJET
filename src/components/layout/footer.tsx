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
    <footer className="relative border-t border-white/[0.08] bg-black text-white/60">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        {/* Top — wordmark + columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/15 bg-white/5">
                <PlaneTakeoff className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              </span>
              <span className="text-[14px] font-semibold tracking-[0.16em] text-white">
                EXJET
                <span className="text-white/40">.com</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-white/50">
              Global Access, On‑Demand. Reserve a private jet in minutes —
              curated worldwide fleet, 24/7 concierge.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/40">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[13px] text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] pt-8 text-[12px] sm:flex-row sm:items-center">
          <p className="font-mono text-white/40">
            © {new Date().getFullYear()} EXJET.com · All rights reserved.
          </p>
          <p className="font-mono text-white/40">
            Global Access, On‑Demand.
          </p>
        </div>
      </div>
    </footer>
  );
}
