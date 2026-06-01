"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";

type TripType = "one-way" | "round-trip" | "multi-leg";

export function HeroSearch() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(2);
  const [tripType, setTripType] = useState<TripType>("one-way");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from,
      to,
      date,
      pax: pax.toString(),
      tripType,
    });
    router.push(`/search?${params}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      {/* trip type tabs */}
      <div className="flex gap-1 mb-3">
        {(["one-way", "round-trip", "multi-leg"] as TripType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              tripType === type
                ? "bg-champagne text-ink"
                : "text-ivory/50 hover:text-ivory/80 border border-ivory/10"
            }`}
          >
            {type.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* inputs */}
      <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/30 pointer-events-none" />
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="From — city or airport"
            className="w-full bg-transparent text-ivory placeholder:text-ivory/35 pl-9 pr-3 py-3 text-sm focus:outline-none"
          />
        </div>

        <div className="w-px bg-ivory/10 hidden sm:block self-stretch" />

        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/30 pointer-events-none" />
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To — city or airport"
            className="w-full bg-transparent text-ivory placeholder:text-ivory/35 pl-9 pr-3 py-3 text-sm focus:outline-none"
          />
        </div>

        <div className="w-px bg-ivory/10 hidden sm:block self-stretch" />

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/30 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-ivory pl-9 pr-3 py-3 text-sm focus:outline-none [color-scheme:dark] min-w-[150px]"
          />
        </div>

        <div className="w-px bg-ivory/10 hidden sm:block self-stretch" />

        <div className="relative flex items-center gap-2 px-3 py-3">
          <Users className="w-4 h-4 text-ivory/30" />
          <button
            type="button"
            onClick={() => setPax(Math.max(1, pax - 1))}
            className="w-5 h-5 rounded-full border border-ivory/20 text-ivory/60 hover:text-ivory text-xs flex items-center justify-center"
          >
            −
          </button>
          <span className="text-ivory text-sm w-4 text-center">{pax}</span>
          <button
            type="button"
            onClick={() => setPax(Math.min(19, pax + 1))}
            className="w-5 h-5 rounded-full border border-ivory/20 text-ivory/60 hover:text-ivory text-xs flex items-center justify-center"
          >
            +
          </button>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-champagne hover:bg-champagne-soft text-ink font-medium rounded-xl px-6 py-3 text-sm transition-colors whitespace-nowrap"
        >
          Search <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
