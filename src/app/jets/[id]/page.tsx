"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, PlaneTakeoff, Users, Navigation, Gauge,
  Shield, Clock, Award, Wifi, Coffee, ChevronRight,
  Wind, Zap, Info,
} from "lucide-react";
import jetsData from "@/data/jets.json";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet } from "@/types";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  light:         "Efficient and versatile — the ideal combination of economy and privacy for regional routes.",
  midsize:       "A refined balance of cabin comfort and range capability. Purpose-built for executive travel.",
  super_midsize: "Elevated cabin standards with extended range. Designed for those who demand both space and performance.",
  heavy:         "A statement of refinement. Full stand-up cabin, club seating, and intercontinental range.",
  ultra_long:    "The apex of private aviation. Uninterrupted intercontinental range with master stateroom and full galley.",
};

const CATEGORY_ORDER = ["light", "midsize", "super_midsize", "heavy", "ultra_long"];

const INCLUDED = [
  { icon: Shield,    label: "ARGUS Platinum operator" },
  { icon: Award,     label: "Pre-flight safety dossier" },
  { icon: Users,     label: "Dedicated FBO meet & greet" },
  { icon: Wifi,      label: "High-speed in-flight Wi-Fi" },
  { icon: Coffee,    label: "Bespoke catering on request" },
  { icon: Clock,     label: "Reschedule free up to 48 hrs" },
];

export default function JetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"cabin" | "performance">("cabin");

  const jet = (jetsData as Jet[]).find((j) => j.id === id);

  if (!jet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f0eb] px-4 text-[#0a1628]">
        <PlaneTakeoff className="mb-6 h-14 w-14 text-neutral-300" strokeWidth={1.25} />
        <h1 className="text-[28px] font-semibold tracking-tight">Aircraft Not Found</h1>
        <p className="mt-2 max-w-md text-center text-[14px] text-neutral-600">
          The aircraft you are looking for is no longer available or has been removed from our platform.
        </p>
        <Link
          href="/search"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white hover:bg-[#1a3461]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Browse all aircraft
        </Link>
      </div>
    );
  }

  const fuelSurcharge = Math.round(jet.hourlyRate * 0.15);
  const fboHandling = 800;
  const categoryDesc = CATEGORY_DESCRIPTIONS[jet.category] ?? "An exceptional private aviation experience.";

  return (
    <div className="min-h-screen bg-[#f5f0eb] pb-28 text-[#0a1628]">

      {/* ── Back nav ── */}
      <div className="px-4 pt-6 sm:px-6">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 transition-colors hover:text-[#0a1628]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Browse fleet
        </Link>
      </div>

      {/* ── Hero image area ── */}
      <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#08111e] to-[#1a3461] sm:mx-6" style={{ aspectRatio: "4/3" }}>
        {/* decorative aircraft illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PlaneTakeoff
            className="h-32 w-32 text-[rgba(255,255,255,0.06)]"
            strokeWidth={0.75}
          />
        </div>

        {/* diagonal line pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* category label top-left */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-[rgba(255,255,255,0.12)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
            {getCategoryLabel(jet.category)}
          </span>
        </div>

        {/* dark caption overlay — bottom */}
        <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-[rgba(0,0,0,0.55)] px-4 py-3 backdrop-blur-sm">
          <p className="text-[14px] leading-snug text-white">{categoryDesc}</p>
        </div>
      </div>

      {/* ── Aircraft name + quick stats ── */}
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-[24px] font-semibold tracking-tight text-[#0a1628] sm:text-[28px]">{jet.name}</h1>
        <p className="mt-1 text-[13px] text-neutral-500">{jet.manufacturer} · {jet.yearBuilt}</p>

        {/* pill stats row */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { icon: Users,      val: `${jet.passengers} passengers` },
            { icon: Navigation, val: `${jet.range} nm range` },
            { icon: Gauge,      val: `${jet.speed} kts` },
          ].map(({ icon: Icon, val }) => (
            <span key={val} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] text-[#0a1628]">
              <Icon className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.75} />
              {val}
            </span>
          ))}
        </div>
      </div>

      {/* ── Category selector pills ── */}
      <div className="mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6 no-scrollbar">
        {CATEGORY_ORDER.map((cat) => {
          const isActive = cat === jet.category;
          return (
            <Link
              key={cat}
              href={`/search?category=${cat}`}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
                isActive
                  ? "border-[#0d1f3c] bg-white font-medium text-[#0d1f3c]"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"
              }`}
            >
              {getCategoryLabel(cat)}
            </Link>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mt-6 border-t border-neutral-200 sm:mx-6" />

      {/* ── What's included ── */}
      <div className="px-4 pt-6 sm:px-6">
        <h2 className="mb-4 text-[16px] font-semibold text-[#0a1628]">What&apos;s included</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {INCLUDED.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-start gap-2">
              <Icon className="h-6 w-6 text-[#0d1f3c]" strokeWidth={1.5} />
              <span className="text-[13px] leading-snug text-neutral-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mt-6 border-t border-neutral-200 sm:mx-6" />

      {/* ── Cabin | Performance tabs ── */}
      <div className="mt-6 px-4 sm:px-6">
        <div className="flex gap-6 border-b border-neutral-200">
          {(["cabin", "performance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "border-b-2 border-[#0d1f3c] text-[#0a1628]"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab === "cabin" ? "Cabin" : "Performance"}
            </button>
          ))}
        </div>

        {/* Cabin tab */}
        {activeTab === "cabin" && (
          <div className="mt-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#0d1f3c]" style={{ aspectRatio: "16/9" }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Users className="h-24 w-24 text-white" strokeWidth={0.5} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-[rgba(0,0,0,0.5)] px-4 py-3">
                <p className="text-[13px] text-white">{jet.passengers} passengers · {jet.amenities.slice(0, 2).join(" · ")}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {jet.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-[13px] text-neutral-600">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0d1f3c]" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance tab */}
        {activeTab === "performance" && (
          <div className="mt-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#060e1c] to-[#162a50]" style={{ aspectRatio: "16/9" }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Wind className="h-24 w-24 text-white" strokeWidth={0.5} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-[rgba(0,0,0,0.5)] px-4 py-3">
                <p className="text-[13px] text-white">{jet.range} nm · {jet.speed} kts · {jet.yearBuilt}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Max Range",     val: `${jet.range} nm` },
                { label: "Cruise Speed",  val: `${jet.speed} kts` },
                { label: "Passengers",    val: `${jet.passengers}` },
                { label: "Year Built",    val: `${jet.yearBuilt}` },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400">{label}</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#0a1628]">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mt-8 border-t border-neutral-200 sm:mx-6" />

      {/* ── Price breakdown ── */}
      <div className="px-4 pt-6 sm:px-6">
        <h2 className="mb-5 text-[16px] font-semibold text-[#0a1628]">Price breakdown</h2>
        <div className="space-y-4">
          {[
            { label: "Base charter rate",  val: formatCurrency(jet.hourlyRate), note: "Per flight hour — EXJET wholesale rate" },
            { label: "Fuel surcharge",     val: `+${formatCurrency(fuelSurcharge)}`, note: "Estimated 15% of base, operator-disclosed" },
            { label: "FBO handling fees",  val: `+${formatCurrency(fboHandling)}`, note: "Varies by departure and arrival FBO" },
          ].map(({ label, val, note }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] text-[#0a1628]">{label}</p>
                <p className="mt-0.5 text-[11px] text-neutral-400">{note}</p>
              </div>
              <p className="shrink-0 text-[14px] font-medium text-[#0a1628]">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Please note ── */}
      <div className="mx-4 mt-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:mx-6">
        {[
          "Quoted rates are per flight hour. Positioning legs, international permit fees, and customs charges may apply on certain routes.",
          "Aircraft images shown are representative of the type. The specific tail assigned may differ in livery while maintaining equivalent or superior specifications.",
          "All operators hold active ARGUS Platinum or Gold ratings. A safety dossier is provided before every departure.",
        ].map((note, i) => (
          <div key={i} className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0d1f3c]" strokeWidth={1.75} />
            <p className="text-[12px] leading-relaxed text-neutral-600">{note}</p>
          </div>
        ))}
      </div>

      {/* ── Sticky bottom CTA bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-[18px] font-semibold tracking-tight text-[#0a1628]">
              {formatCurrency(jet.hourlyRate)}<span className="text-[13px] font-normal text-neutral-500">/hr</span>
            </p>
            <div className="mt-0.5 flex items-center gap-3 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" strokeWidth={2} /> {jet.passengers} pax
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="h-3 w-3" strokeWidth={2} /> {jet.range} nm
              </span>
            </div>
          </div>
          <Link
            href={`/booking?jet=${jet.id}`}
            className="flex-shrink-0 rounded-full bg-[#0d1f3c] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98]"
          >
            Book this jet
          </Link>
        </div>
      </div>

    </div>
  );
}
