import Link from "next/link";

const navLinks = [
  { label: "Browse Fleet", href: "/search" },
  { label: "Empty Legs", href: "/empty-legs" },
  { label: "Live Tracking", href: "/tracking" },
  { label: "My Trips", href: "/dashboard" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Safety Standards", href: "/safety" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#07101e]/08 bg-[#07101e]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">

        {/* 3-column layout */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Column 1: Brand */}
          <div>
            <Link
              href="/"
              className="font-serif text-[21px] font-bold uppercase tracking-[0.18em] text-white"
            >
              EXJET
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-[1.8] text-white/45">
              Private jet charter confirmed in under 4 hours. 5,000+ airports.
              2,400+ aircraft. ARGUS Platinum safety. No membership required.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#c4a052]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                24/7 Concierge Available
              </span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "#c4a052" }}>
              Book
            </h3>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/55 transition-colors hover:text-[#c4a052]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal / Contact */}
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "#c4a052" }}>
              Legal &amp; Support
            </h3>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/55 transition-colors hover:text-[#c4a052]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                Reservations
              </p>
              <a
                href="mailto:fly@exjet.com"
                className="mt-1 block text-[13px] text-white/55 transition-colors hover:text-[#c4a052]"
              >
                fly@exjet.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/08 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/22">
            &copy; {new Date().getFullYear()} EXJET. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/22">
            ARGUS Platinum &middot; Wyvern Wingman
          </p>
        </div>
      </div>
    </footer>
  );
}
