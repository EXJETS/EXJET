"use client";

import { useState } from "react";
import Link from "next/link";
import { PlaneTakeoff, ChevronRight, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type TabId = "upcoming" | "past" | "cancelled";

const upcomingFlights = [
  {
    id: "bk-001",
    jet: "Gulfstream G650ER",
    from: "Teterboro (KTEB)",
    to: "London Heathrow (EGLL)",
    date: "2026-04-15",
    departTime: "08:00",
    arrivalTime: "19:45",
    status: "confirmed" as const,
    price: 56810,
  },
  {
    id: "bk-002",
    jet: "Praetor 500",
    from: "Miami (KMIA)",
    to: "Austin (KAUS)",
    date: "2026-04-22",
    departTime: "10:30",
    arrivalTime: "13:15",
    status: "confirmed" as const,
    price: 23712,
  },
];

const pastFlights = [
  {
    id: "bk-003",
    jet: "Citation CJ4",
    from: "Palm Beach (KPBI)",
    to: "Chicago Midway (KMDW)",
    date: "2026-03-10",
    departTime: "09:00",
    status: "completed" as const,
    price: 15808,
  },
  {
    id: "bk-004",
    jet: "Falcon 900LX",
    from: "San Francisco (KSFO)",
    to: "Las Vegas (KLAS)",
    date: "2026-02-28",
    departTime: "14:00",
    status: "completed" as const,
    price: 35568,
  },
  {
    id: "bk-005",
    jet: "Challenger 350",
    from: "Dallas (KADS)",
    to: "Denver (KDEN)",
    date: "2026-01-15",
    departTime: "07:30",
    status: "completed" as const,
    price: 27664,
  },
];

const cancelledFlights = [
  {
    id: "bk-006",
    jet: "Phenom 300E",
    from: "New York (KTEB)",
    to: "Boston (KBOS)",
    date: "2025-12-20",
    departTime: "15:00",
    status: "cancelled" as const,
    price: 12400,
  },
];

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: "confirmed" | "completed" | "cancelled" }) {
  const config = {
    confirmed:  { label: "Confirmed", cls: "bg-emerald-100 text-emerald-800" },
    completed:  { label: "Completed", cls: "bg-emerald-600 text-white" },
    cancelled:  { label: "Cancelled", cls: "bg-amber-100 text-amber-800" },
  };
  const { label, cls } = config[status];
  return (
    <span className={`inline-block rounded-md px-2.5 py-1 text-[12px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function FlightCard({
  flight,
  showActions,
}: {
  flight: (typeof pastFlights)[number];
  showActions?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="p-5">
        <StatusBadge status={flight.status as "confirmed" | "completed" | "cancelled"} />

        <p className="mt-3 text-[15px] font-semibold text-[#0a1628]">
          {fmtDate(flight.date)} · {flight.departTime}
        </p>

        <Link
          href={`/dashboard/bookings/${flight.id}`}
          className="mt-3 flex items-stretch gap-3"
        >
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="h-2 w-2 rounded-full border-2 border-neutral-400" />
            <div className="w-px flex-1 bg-neutral-200" />
            <div className="h-2 w-2 rounded-full bg-[#0d1f3c]" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[14px] text-neutral-700">{flight.from}</p>
            <p className="text-[14px] text-[#0a1628] font-medium">{flight.to}</p>
          </div>
          <ChevronRight className="self-center h-4 w-4 text-neutral-400 shrink-0" strokeWidth={2} />
        </Link>

        <p className="mt-3 text-[13px] text-neutral-500">
          {flight.jet} · {formatCurrency(flight.price)}
        </p>
      </div>

      {showActions && (
        <div className="flex border-t border-neutral-100">
          <Link
            href="/search"
            className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-[#0a1628] transition-colors hover:bg-neutral-50"
          >
            <PlaneTakeoff className="h-3.5 w-3.5" strokeWidth={1.75} /> Book again
          </Link>
          <div className="w-px bg-neutral-100" />
          <Link
            href="/search"
            className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-[#0a1628] transition-colors hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} /> Book return
          </Link>
        </div>
      )}

      {!showActions && (
        <div className="border-t border-neutral-100">
          <Link
            href="/search"
            className="flex w-full items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-[#0a1628] transition-colors hover:bg-neutral-50"
          >
            <PlaneTakeoff className="h-3.5 w-3.5" strokeWidth={1.75} /> Book again
          </Link>
        </div>
      )}
    </div>
  );
}

function UpcomingCard({ flight }: { flight: (typeof upcomingFlights)[number] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="p-5">
        <StatusBadge status={flight.status} />

        <p className="mt-3 text-[15px] font-semibold text-[#0a1628]">
          {fmtDate(flight.date)} · {flight.departTime}
        </p>

        <Link
          href={`/dashboard/bookings/${flight.id}`}
          className="mt-3 flex items-stretch gap-3"
        >
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="h-2 w-2 rounded-full border-2 border-neutral-400" />
            <div className="w-px flex-1 bg-neutral-200" />
            <div className="h-2 w-2 rounded-full bg-[#0d1f3c]" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[14px] text-neutral-700">{flight.from}</p>
            <p className="text-[14px] text-[#0a1628] font-medium">{flight.to}</p>
          </div>
          <ChevronRight className="self-center h-4 w-4 text-neutral-400 shrink-0" strokeWidth={2} />
        </Link>

        <p className="mt-3 text-[13px] text-neutral-500">
          {flight.jet} · {formatCurrency(flight.price)}
        </p>
      </div>

      <div className="border-t border-neutral-100">
        <Link
          href={`/dashboard/bookings/${flight.id}`}
          className="flex w-full items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-[#0a1628] transition-colors hover:bg-neutral-50"
        >
          View details <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");

  const tabs: { id: TabId; label: string }[] = [
    { id: "upcoming",  label: "Upcoming" },
    { id: "past",      label: "Past" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">

      {/* Title */}
      <h1 className="mb-6 text-center text-[28px] font-semibold tracking-tight text-[#0a1628]">
        My Flights
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 pb-3 text-[14px] font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[#0d1f3c] text-[#0a1628]"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">

        {/* Upcoming */}
        {activeTab === "upcoming" && (
          <>
            {upcomingFlights.length > 0 ? (
              <div className="space-y-3">
                {upcomingFlights.map((f) => (
                  <UpcomingCard key={f.id} flight={f} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                  <PlaneTakeoff className="h-7 w-7 text-neutral-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-semibold text-[#0a1628]">No upcoming flights</h2>
                <p className="mt-2 max-w-xs text-[14px] text-neutral-500">
                  As soon as you book a charter, all relevant details will appear here.
                </p>
              </div>
            )}

            <div className="mt-6">
              <Link
                href="/search"
                className="flex w-full items-center justify-center rounded-full border border-[#0d1f3c] px-6 py-3.5 text-[14px] font-medium text-[#0d1f3c] transition-colors hover:bg-[#0d1f3c] hover:text-white"
              >
                Book a flight
              </Link>
            </div>
          </>
        )}

        {/* Past */}
        {activeTab === "past" && (
          <div className="space-y-3">
            {pastFlights.map((f) => (
              <FlightCard key={f.id} flight={f} showActions />
            ))}
          </div>
        )}

        {/* Cancelled */}
        {activeTab === "cancelled" && (
          <div className="space-y-3">
            {cancelledFlights.length > 0 ? (
              cancelledFlights.map((f) => (
                <FlightCard key={f.id} flight={f} showActions={false} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                  <PlaneTakeoff className="h-7 w-7 text-neutral-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-semibold text-[#0a1628]">No cancelled flights</h2>
                <p className="mt-2 text-[14px] text-neutral-500">Cancelled bookings will appear here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
