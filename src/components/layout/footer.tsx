import Link from "next/link";
import {
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
      { label: "Aircraft Sales", href: "/aircraft-sales" },
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
    <footer className="relative border-t border-neutral-200 bg-[#f2f2f7] text-[#0a1628]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        {/* Editorial top — large wordmark + tagline */}
        <div className="border-b border-neutral-200 pb-14">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#0d1f3c]">
                EXJET · Global Access, On-Demand.
              </span>
              <h2 className="mt-5 font-serif text-[44px] leading-[1.05] text-[#0a1628] sm:text-[56px]">
                The world,
                <br />
                <em className="italic font-normal text-neutral-500">
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-transparent text-[#0a1628] transition-colors hover:border-[#0d1f3c] hover:text-[#0d1f3c]"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 pt-14 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg width="18" height="16" viewBox="0 0 22 20" fill="none">
                <path d="M11 1L21 19H1L11 1Z" fill="none" stroke="#0a1628" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M11 7L16 19H6L11 7Z" fill="#0a1628" fillOpacity="0.35" />
              </svg>
              <span className="font-mono text-[14px] font-semibold tracking-[0.12em] text-[#0a1628]">
                EXJET
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-[13px] leading-[1.8] text-neutral-500">
              An invitation to travel without compromise. Curated worldwide
              fleet. 24/7 concierge. Confirmed in under four hours.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0d1f3c]">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-[13px] text-[#0a1628] transition-colors hover:text-[#0d1f3c]"
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
        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-8 text-[12px] sm:flex-row sm:items-center">
          <p className="font-mono uppercase tracking-[0.18em] text-neutral-400">
            © {new Date().getFullYear()} EXJET · All rights reserved.
          </p>
          <p className="font-mono uppercase tracking-[0.18em] text-neutral-400">
            ARGUS Platinum · Wyvern Wingman
          </p>
        </div>
      </div>
    </footer>
  );
}
