"use client";

import Link from "next/link";
import { ArrowLeft, Plane, Radio, ArrowRight } from "lucide-react";
import { LiveTracker } from "@/components/jets/live-tracker";
import jetsData from "@/data/jets.json";
import type { Jet } from "@/types";

// Client's booked jets (demo)
const myBookedJets = ["gulfstream-g650er", "praetor-500"];

export default function ClientTrackingPage() {
  const jets = (jetsData as Jet[]).filter((j) => myBookedJets.includes(j.id));

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">Track My Jets</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">ADS-B Live</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Real-time position of your chartered aircraft, powered by ADS-B Exchange.
      </p>

      <div className="space-y-8">
        {jets.map((jet) => (
          <div key={jet.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-900">{jet.name}</h2>
                <p className="text-xs text-gray-400">{jet.manufacturer} · Your upcoming charter</p>
              </div>
              <Link href={`/jets/${jet.id}`} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                View details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <LiveTracker jet={jet} />
          </div>
        ))}
      </div>

      {jets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Plane className="w-12 h-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No active charters</h3>
          <p className="text-sm text-gray-400 mb-6">Book a flight to track your aircraft live.</p>
          <Link href="/search" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600">
            Browse Jets
          </Link>
        </div>
      )}
    </div>
  );
}
