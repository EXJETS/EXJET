"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Bell, BellRing, SlidersHorizontal, X } from "lucide-react";
import { LegCard } from "@/components/leg-card";
import { Button, Counter, EmptyState, Field, Input, PageHeader, Select, SkeletonList } from "@/components/ui";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/data/aircraft";
import { cn, money, plural, today } from "@/lib/format";
import { filterLegs, REGION_LABELS, type LegFilters, type LegSort } from "@/lib/legs";
import type { Region } from "@/lib/types";
import { useApp, useHydrated, useLiveLegs } from "@/store/app-store";

const REGIONS: ("all" | Region)[] = ["all", "north-america", "europe", "caribbean", "middle-east"];
const PRICES = [0, 5000, 10000, 20000, 50000];

function read(sp: URLSearchParams): LegFilters {
  const n = (k: string) => Number(sp.get(k)) || undefined;
  return {
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    date: sp.get("date") ?? "",
    pax: n("pax"),
    maxPrice: n("max"),
    region: (sp.get("region") as Region) || "all",
    category: (sp.get("cat") as LegFilters["category"]) || "all",
    sort: (sp.get("sort") as LegSort) || "soonest",
  };
}

function write(f: LegFilters): string {
  const p = new URLSearchParams();
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.date) p.set("date", f.date);
  if (f.pax && f.pax > 1) p.set("pax", String(f.pax));
  if (f.maxPrice) p.set("max", String(f.maxPrice));
  if (f.region && f.region !== "all") p.set("region", f.region);
  if (f.category && f.category !== "all") p.set("cat", f.category);
  if (f.sort && f.sort !== "soonest") p.set("sort", f.sort);
  return p.toString();
}

export function EmptyLegsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const ready = useHydrated();
  const legs = useLiveLegs();
  const [f, setF] = useState<LegFilters>(() => read(new URLSearchParams(params.toString())));
  const [showFilters, setShowFilters] = useState(false);

  // Mirror filters into the URL so searches are shareable and survive reloads.
  useEffect(() => {
    const q = write(f);
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [f, pathname, router]);

  const results = useMemo(() => filterLegs(legs, f), [legs, f]);
  const set = (patch: Partial<LegFilters>) => setF((prev) => ({ ...prev, ...patch }));
  const extraCount = [f.date, f.pax && f.pax > 1, f.maxPrice, f.category !== "all"].filter(Boolean).length;
  const best = legs.reduce((m, l) => Math.max(m, l.discountPct), 0);

  return (
    <>
      <PageHeader
        eyebrow="Empty legs"
        title={
          <>
            Whole jet. <span className="text-gold">Up to {best || 75}% off.</span>
          </>
        }
        description="When a jet flies empty to pick up its next guests, you can take it — every seat — for a fixed, all-in price."
      />

      <div className="mt-8 rounded-2xl border border-line bg-surface p-3">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto]">
          <Input value={f.from} onChange={(e) => set({ from: e.target.value })} placeholder="From — anywhere" aria-label="From" className="h-12" enterKeyHint="search" />
          <button
            type="button"
            aria-label="Swap"
            onClick={() => set({ from: f.to, to: f.from })}
            className="mx-auto flex h-9 w-9 items-center justify-center self-center rounded-full border border-line text-muted hover:text-ink"
          >
            <ArrowUpDown className="h-4 w-4 md:rotate-90" strokeWidth={1.8} />
          </button>
          <Input value={f.to} onChange={(e) => set({ to: e.target.value })} placeholder="To — anywhere" aria-label="To" className="h-12" enterKeyHint="search" />
          <Button variant={showFilters || extraCount ? "primary" : "secondary"} className="h-12" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters{extraCount ? ` · ${extraCount}` : ""}
          </Button>
        </div>
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 lg:grid-cols-4">
            <Field label="Departing from">
              <Input type="date" min={today()} value={f.date} onChange={(e) => set({ date: e.target.value })} />
            </Field>
            <Field label="Guests" group>
              <Counter value={f.pax ?? 1} onChange={(pax) => set({ pax })} label="guests" />
            </Field>
            <Field label="Max price">
              <Select value={f.maxPrice ?? 0} onChange={(e) => set({ maxPrice: Number(e.target.value) || undefined })}>
                {PRICES.map((p) => (
                  <option key={p} value={p}>
                    {p ? `Under ${money(p)}` : "Any price"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Aircraft size">
              <Select value={f.category} onChange={(e) => set({ category: e.target.value as LegFilters["category"] })}>
                <option value="all">Any size</option>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Field>
            {extraCount > 0 && (
              <button
                type="button"
                onClick={() => set({ date: "", pax: undefined, maxPrice: undefined, category: "all" })}
                className="col-span-2 inline-flex items-center justify-center gap-1 text-[13px] text-muted hover:text-ink lg:col-span-4"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set({ region: r })}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition",
                f.region === r ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-line-strong"
              )}
            >
              {r === "all" ? "All regions" : REGION_LABELS[r]}
            </button>
          ))}
        </div>
        <Select
          aria-label="Sort"
          value={f.sort}
          onChange={(e) => set({ sort: e.target.value as LegSort })}
          className="h-10 w-auto shrink-0 self-start rounded-full text-[14px] sm:self-auto"
        >
          <option value="soonest">Soonest first</option>
          <option value="price">Lowest price</option>
          <option value="discount">Biggest saving</option>
        </Select>
      </div>

      {!ready ? (
        <SkeletonList className="mt-6 sm:grid-cols-2 lg:grid-cols-3" count={6} />
      ) : (
        <>
          <p className="mt-6 text-[13px] text-muted">{plural(results.length, "flight")} available</p>
          {results.length ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((v) => (
                <LegCard key={v.leg.id} view={v} />
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <EmptyState
                title="Nothing on this route right now"
                body="Operators release new empty legs every day. Set an alert and we'll flag new matches."
              />
            </div>
          )}
          <AlertPrompt from={f.from ?? ""} to={f.to ?? ""} maxPrice={f.maxPrice} />
        </>
      )}
    </>
  );
}

function AlertPrompt({ from, to, maxPrice }: { from: string; to: string; maxPrice?: number }) {
  const alerts = useApp((s) => s.alerts);
  const sessionUserId = useApp((s) => s.sessionUserId);
  const addAlert = useApp((s) => s.addAlert);
  const mine = alerts.filter((a) => a.userId === sessionUserId);
  const exists = mine.some(
    (a) => a.from.toLowerCase() === from.trim().toLowerCase() && a.to.toLowerCase() === to.trim().toLowerCase() && a.maxPrice === maxPrice
  );

  return (
    <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-soft">Route alert</p>
        <p className="mt-2 text-[22px] font-semibold tracking-tight">Be first when a jet repositions.</p>
        <p className="mt-1 text-[14px] text-white/60">
          {from || "Anywhere"} → {to || "Anywhere"}
          {maxPrice ? ` · under ${money(maxPrice)}` : ""}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        {exists ? (
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-[14px] font-medium">
            <BellRing className="h-4 w-4 text-gold-soft" /> Alert is on
          </span>
        ) : (
          <Button variant="secondary" onClick={() => addAlert({ from: from.trim(), to: to.trim(), maxPrice })}>
            <Bell className="h-4 w-4" /> Alert me
          </Button>
        )}
        <Link href="/alerts/" className="text-center text-[13px] text-white/60 hover:text-white">
          Manage alerts{mine.length ? ` (${mine.length})` : ""}
        </Link>
      </div>
    </div>
  );
}
