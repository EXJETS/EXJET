"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeftRight,
  Tag,
  Briefcase,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "charter" | "empty";
type Trip = "oneway" | "roundtrip";

const modes: { id: Mode; label: string; icon: typeof Briefcase; hint: string }[] = [
  { id: "charter", label: "Charter",     icon: Briefcase, hint: "Book the entire jet" },
  { id: "empty",   label: "Empty Legs",  icon: Tag,       hint: "Last‑minute deals up to 70% off" },
];

export function FlightBookingWidget() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("charter");
  const [trip, setTrip] = useState<Trip>("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [pax, setPax] = useState(1);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (depart) params.set("date", depart);
    if (trip === "roundtrip" && ret) params.set("returnDate", ret);
    params.set("passengers", String(pax));
    params.set("mode", mode);
    router.push(`/search?${params.toString()}`);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="relative w-full">
      {/* Tabs — Charter / Empty Legs */}
      <div className="flex items-center gap-1 rounded-t-2xl border-b border-neutral-200 bg-neutral-50 p-1.5 backdrop-blur-xl">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "group flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all",
              mode === m.id
                ? "bg-neutral-950 text-neutral-950 shadow-sm"
                : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100"
            )}
          >
            <m.icon className="h-4 w-4" strokeWidth={1.75} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Hint + trip toggle */}
      <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
        <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
          {modes.find((m) => m.id === mode)?.hint}
        </p>
        {mode === "charter" && (
          <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-0.5 text-[12px]">
            <button
              type="button"
              onClick={() => setTrip("oneway")}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                trip === "oneway" ? "bg-neutral-950 text-neutral-950" : "text-neutral-700 hover:text-neutral-950"
              )}
            >
              One‑way
            </button>
            <button
              type="button"
              onClick={() => setTrip("roundtrip")}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                trip === "roundtrip" ? "bg-neutral-950 text-neutral-950" : "text-neutral-700 hover:text-neutral-950"
              )}
            >
              Round‑trip
            </button>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="p-4 sm:p-5">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto]">
          {/* From */}
          <Field
            icon={PlaneTakeoff}
            label="From"
            placeholder="City or airport"
            value={from}
            onChange={setFrom}
          />

          {/* Swap */}
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="hidden md:flex h-10 w-10 self-end items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950 mb-1"
          >
            <ArrowLeftRight className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {/* To */}
          <Field
            icon={PlaneLanding}
            label="To"
            placeholder="City or airport"
            value={to}
            onChange={setTo}
          />

          {/* Depart */}
          <Field
            icon={Calendar}
            label="Depart"
            type="date"
            value={depart}
            onChange={setDepart}
          />

          {/* Return (roundtrip) or Pax (oneway/empty) */}
          {mode === "charter" && trip === "roundtrip" ? (
            <Field
              icon={Calendar}
              label="Return"
              type="date"
              value={ret}
              onChange={setRet}
            />
          ) : (
            <PaxField value={pax} onChange={setPax} />
          )}

          {/* Submit */}
          <button
            type="submit"
            className="group mt-2 inline-flex h-[58px] items-center justify-center gap-2 self-end rounded-xl bg-white px-6 text-[13px] font-semibold text-black transition-colors hover:bg-neutral-800 md:mt-0"
          >
            <Search className="h-4 w-4" strokeWidth={2.25} />
            Search
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          </button>
        </div>

        {/* Pax on second row for round-trip */}
        {mode === "charter" && trip === "roundtrip" && (
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <PaxField value={pax} onChange={setPax} />
          </div>
        )}

        <p className="mt-4 text-[11px] text-neutral-400">
          No account required to quote. Free to search. Transparent pricing.
        </p>
      </form>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  icon: typeof Users;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="group flex h-[58px] flex-col justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1 transition-colors focus-within:border-neutral-400 focus-within:bg-neutral-100">
      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-neutral-500" strokeWidth={1.75} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[14px] text-neutral-950 placeholder:text-neutral-400 outline-none"
        />
      </div>
    </label>
  );
}

function PaxField({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex h-[58px] flex-col justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        Passengers
      </span>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-neutral-500" strokeWidth={1.75} />
        <div className="flex flex-1 items-center justify-between">
          <span className="text-[14px] text-neutral-950">
            {value} {value === 1 ? "Guest" : "Guests"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChange(Math.max(1, value - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
              aria-label="Decrease"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => onChange(Math.min(19, value + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
