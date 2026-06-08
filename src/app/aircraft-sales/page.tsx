import Link from "next/link";
import { Lock, PlaneTakeoff } from "lucide-react";
import type { Metadata } from "next";
import listings from "@/data/aircraft-sales.json";

export const metadata: Metadata = {
  title: "Aircraft Sales & Leasing",
  description:
    "Pre-owned aircraft and dry leases represented by EXJET. Full log review, pre-purchase inspection coordination, title, and escrow services included.",
};

/* ── types ────────────────────────────────────────── */
type Listing = (typeof listings)[number];
type Status = Listing["status"];

/* ── helpers ──────────────────────────────────────── */
function fmtM(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}
function fmtHrs(n: number) {
  return n.toLocaleString("en-US");
}

/* ── status badge ─────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  if (status === "sold")
    return (
      <span className="rounded-sm bg-neutral-400 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        Sold
      </span>
    );
  if (status === "off_market")
    return (
      <span className="flex items-center gap-1.5 rounded-sm bg-[#0d1f3c] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        <Lock className="h-3 w-3" strokeWidth={2.5} />
        Off-Market
      </span>
    );
  if (status === "for_lease")
    return (
      <span className="rounded-sm bg-[#0d1f3c] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        For Lease
      </span>
    );
  return (
    <span className="rounded-sm bg-[#0d1f3c] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
      For Sale
    </span>
  );
}

/* ── price block ──────────────────────────────────── */
function PriceBlock({ listing }: { listing: Listing }) {
  if (listing.status === "sold")
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          Sale Price
        </p>
        <p className="mt-0.5 text-[22px] font-semibold text-neutral-400 line-through">
          {listing.salePrice ? fmtM(listing.salePrice) : "—"}
        </p>
      </div>
    );
  if (listing.status === "off_market")
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          Confidential Listing
        </p>
        <p className="mt-0.5 text-[22px] font-semibold text-[#0d1f3c]">
          Inquire
        </p>
      </div>
    );
  if (listing.status === "for_lease")
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          Dry Lease
        </p>
        <p className="mt-0.5 text-[22px] font-semibold text-[#0d1f3c]">
          Contact
        </p>
      </div>
    );
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
        Sale Price
      </p>
      <p className="mt-0.5 text-[22px] font-semibold text-[#0d1f3c]">
        {listing.salePrice ? fmtM(listing.salePrice) : "Price on request"}
      </p>
    </div>
  );
}

/* ── CTA button ───────────────────────────────────── */
function CtaButton({ status }: { status: Status }) {
  if (status === "sold")
    return (
      <Link
        href="/search"
        className="inline-flex items-center rounded-sm border border-neutral-300 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
      >
        View Similar
      </Link>
    );
  if (status === "off_market")
    return (
      <Link
        href="/auth/register"
        className="inline-flex items-center rounded-sm bg-[#0d1f3c] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#1a3461]"
      >
        Inquire (NDA)
      </Link>
    );
  if (status === "for_lease")
    return (
      <Link
        href="/auth/register"
        className="inline-flex items-center rounded-sm bg-[#0d1f3c] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#1a3461]"
      >
        Lease Terms
      </Link>
    );
  return (
    <Link
      href="/auth/register"
      className="inline-flex items-center rounded-sm bg-[#0d1f3c] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#1a3461]"
    >
      Request Info
    </Link>
  );
}

/* ── listing card ─────────────────────────────────── */
function ListingCard({ listing }: { listing: Listing }) {
  const isSold = listing.status === "sold";

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Image area */}
      <div className="relative bg-dotgrid bg-[#f5f5f5]">
        {/* Category tag */}
        <div className="absolute left-4 top-4 z-10">
          <span className="border-l-2 border-[#0d1f3c] pl-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#0d1f3c]">
            {listing.category}
          </span>
        </div>
        {/* Status badge */}
        <div className="absolute right-4 top-4 z-10">
          <StatusBadge status={listing.status} />
        </div>

        {/* Aircraft illustration placeholder */}
        <div className="relative flex h-56 items-center justify-center sm:h-64">
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="select-none font-serif text-[72px] font-bold uppercase tracking-widest text-neutral-300 opacity-60">
                Sold
              </span>
            </div>
          )}
          <PlaneTakeoff
            className="h-24 w-24 text-neutral-300"
            strokeWidth={0.75}
          />
        </div>

        {/* Image dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          <div className="h-1.5 w-5 rounded-full bg-[#0d1f3c]" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white p-5">
        {/* Year + hours */}
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          {listing.year}
          <span className="mx-2 text-[#0d1f3c]">·</span>
          {fmtHrs(listing.totalTimeHours)} TT HRS
        </p>

        {/* Model name */}
        <h2 className="mt-1.5 text-[26px] font-semibold leading-tight text-[#0d1f3c]">
          {listing.model}
        </h2>

        {/* Description */}
        <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-500">
          {listing.description}
        </p>

        {/* Specs grid */}
        <div className="mt-4 border-t border-neutral-100 pt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Seats
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0d1f3c]">
              {listing.seats}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Max Range
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0d1f3c]">
              {listing.range.toLocaleString()} nm
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Cruise Speed
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0d1f3c]">
              {listing.speed} kts
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Total Time
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0d1f3c]">
              {fmtHrs(listing.totalTimeHours)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Engines
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0d1f3c]">
              {listing.engines}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Paint / Interior
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-[#0d1f3c]">
              {listing.paintYear} / {listing.interiorYear}
            </p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-end justify-between border-t border-neutral-100 pt-4">
          <PriceBlock listing={listing} />
          <CtaButton status={listing.status} />
        </div>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────── */
export default function AircraftSalesPage() {
  const activeCount = listings.filter(
    (l) => l.status !== "sold"
  ).length;

  return (
    <div className="flex flex-col">
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f5f0eb] px-4 pb-10 pt-24">
        <div className="mx-auto max-w-2xl lg:max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            <Link href="/" className="hover:text-[#0a1628] transition-colors">
              Home
            </Link>
            <span className="text-neutral-300">›</span>
            <span className="text-neutral-600">Aircraft Sales</span>
          </nav>

          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              IADA Registered Brokerage
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-[#0a1628]">
            Aircraft Sales &<br />Leasing.
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-500">
            Pre-owned aircraft and dry leases represented by EXJET. Full log
            review, pre-purchase inspection coordination, title, and escrow
            services included.
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            {[
              { value: String(activeCount), label: "Active Listings" },
              { value: "IADA", label: "Registered" },
              { value: "112", label: "Transactions" },
            ].map((stat) => (
              <div
                key={stat.value}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              >
                <p className="text-[22px] font-semibold text-[#0a1628]">{stat.value}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase leading-snug tracking-[0.15em] text-neutral-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LISTINGS
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f5f0eb] px-4 py-12">
        <div className="mx-auto max-w-2xl lg:max-w-7xl">
          {/* Section header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-300" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Current Listings
            </span>
            <div className="h-px flex-1 bg-neutral-300" />
          </div>

          {/* Subheading */}
          <div className="mb-8 text-center">
            <h2 className="font-serif text-[clamp(1.8rem,5vw,3.5rem)] font-normal leading-[1.1] text-[#0d1f3c]">
              Aircraft for sale &
              <br />
              <span className="italic text-neutral-400">lease.</span>
            </h2>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Sell / Consign CTA */}
          <div className="mt-12 overflow-hidden rounded-3xl bg-[#0d1f3c] px-6 py-8 text-white lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.45)]">
                  Sell or Lease Your Aircraft
                </p>
                <h3 className="mt-1 font-serif text-[1.75rem] leading-tight">
                  Looking to sell or place
                  <br />
                  your aircraft on a dry lease?
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[rgba(255,255,255,0.55)]">
                  EXJET manages the full transaction — valuation, marketing,
                  buyer qualification, and closing.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-sm bg-white px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#0d1f3c] transition-opacity hover:opacity-85"
                >
                  List Your Aircraft
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-sm border border-[rgba(255,255,255,0.25)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                >
                  Get Valuation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
