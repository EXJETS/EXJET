"use client";

import { useState } from "react";
import { Search, Filter, Plane, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const bookings = [
  { id: "B-1038", client: "Alexander M.", jet: "Gulfstream G500",    route: "KTEB → EGLL", date: "2026-04-15", pax: 8,  amount: 38400, status: "confirmed"  as const, received: "2026-04-01" },
  { id: "B-1039", client: "Sophia L.",    jet: "Challenger 350",     route: "KSFO → KDAL", date: "2026-04-16", pax: 6,  amount: 22200, status: "confirmed"  as const, received: "2026-03-30" },
  { id: "B-1040", client: "James R.",     jet: "Citation Longitude", route: "KMIA → KBOS", date: "2026-04-17", pax: 10, amount: 19600, status: "pending"    as const, received: "2026-04-03" },
  { id: "B-1041", client: "Victoria K.", jet: "Gulfstream G500",    route: "KTEB → KLAS", date: "2026-04-18", pax: 4,  amount: 29800, status: "pending"    as const, received: "2026-04-03" },
  { id: "B-1036", client: "Michael B.",  jet: "Praetor 600",        route: "KDAL → KDEN", date: "2026-04-10", pax: 7,  amount: 17400, status: "completed"  as const, received: "2026-03-20" },
  { id: "B-1035", client: "Emma W.",     jet: "Challenger 350",     route: "KORD → KATL", date: "2026-04-08", pax: 5,  amount: 14800, status: "completed"  as const, received: "2026-03-18" },
  { id: "B-1034", client: "Robert D.",   jet: "Citation Longitude", route: "KBOS → KMIA", date: "2026-04-05", pax: 9,  amount: 18200, status: "cancelled"  as const, received: "2026-03-15" },
];

const tabs = ["all", "pending", "confirmed", "completed", "cancelled"] as const;
type Tab = typeof tabs[number];

export default function OperatorBookingsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    if (tab !== "all" && b.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.client.toLowerCase().includes(q) || b.jet.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = tabs.reduce((acc, t) => ({ ...acc, [t]: t === "all" ? bookings.length : bookings.filter(b => b.status === t).length }), {} as Record<Tab, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">Bookings</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-ivory-deep)] rounded-xl p-1 mb-5 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
              tab === t ? "bg-[var(--color-ivory)] text-[var(--color-ink)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]"
            )}
          >
            {t} {counts[t] > 0 && <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[9px]", tab === t ? "bg-champagne text-white" : "bg-[var(--color-bone)] text-[var(--color-muted)]")}>{counts[t]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-subtle)]" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bookings..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm focus:border-[var(--color-hairline-strong)] outline-none bg-[var(--color-ivory)] text-[var(--color-ink)]"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-ivory-deep)] border-b border-[var(--color-hairline)]">
              <tr>
                {["Booking ID", "Client", "Aircraft", "Route", "Date", "Pax", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-hairline)]">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[var(--color-ivory-deep)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[var(--color-ink-soft)]">{b.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-champagne/10 border border-champagne/20 flex items-center justify-center text-champagne text-[10px] font-bold">
                        {b.client.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-[var(--color-ink)]">{b.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-[var(--color-subtle)]" />
                      <span className="text-[var(--color-ink-soft)]">{b.jet}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{b.route}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)] whitespace-nowrap">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{b.pax}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{formatCurrency(b.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    {b.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <button className="p-1.5 rounded-lg bg-[var(--color-forest)]/10 hover:bg-[var(--color-forest)]/20 text-[var(--color-forest)]" title="Accept"><CheckCircle className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg bg-[var(--color-bordeaux)]/8 hover:bg-[var(--color-bordeaux)]/15 text-[var(--color-bordeaux)]" title="Decline"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button className="text-xs text-champagne hover:text-[var(--color-ink-soft)] font-medium">View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[var(--color-subtle)]">
            <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
