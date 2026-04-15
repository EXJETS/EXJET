"use client";

import Link from "next/link";
import { Plane, Radio, ArrowRight } from "lucide-react";
import { LiveTracker } from "@/components/jets/live-tracker";
import jetsData from "@/data/jets.json";
import type { Jet } from "@/types";

// Client's booked jets (demo)
const myBookedJets = ["gulfstream-g650er", "praetor-500"];

export default function ClientTrackingPage() {
  const jets = (jetsData as Jet[]).filter((j) => myBookedJets.includes(j.id));

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-2 flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Track My Jets</p>
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/20">
          ADS-B Live
        </span>
      </div>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-white">Your Active Charters</h1>
      <p className="mt-1 text-[13px] text-white/60">
        Real-time position of your chartered aircraft, powered by ADS-B Exchange.
      </p>

      <div className="mt-8 space-y-8">
        {jets.map((jet) => (
          <div key={jet.id}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold tracking-tight text-white">{jet.name}</h2>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {jet.manufacturer} · Your upcoming charter
                </p>
              </div>
              <Link
                href={`/jets/${jet.id}`}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-white/70 transition-colors hover:text-white"
              >
                View details <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </div>
            <LiveTracker jet={jet} />
          </div>
        ))}
      </div>

      {jets.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] py-20 text-center backdrop-blur-xl">
          <Plane className="mb-4 h-12 w-12 text-white/20" strokeWidth={1.25} />
          <h3 className="text-[18px] font-semibold tracking-tight text-white">No active charters</h3>
          <p className="mt-2 text-[13px] text-white/50">Book a flight to track your aircraft live.</p>
          <Link
            href="/search"
            className="mt-6 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-black transition-colors hover:bg-white/90 active:scale-[0.98]"
          >
            Browse Jets
          </Link>
        </div>
      )}
    </div>
  );
}
