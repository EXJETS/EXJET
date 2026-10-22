"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Calendar, Check, Clock, Gauge, Info, Luggage, Share, Users } from "lucide-react";
import { LegCard } from "@/components/leg-card";
import { RouteLine } from "@/components/route";
import { Badge, Card, EmptyState, LinkButton, SkeletonList } from "@/components/ui";
import { CATEGORY_LABELS } from "@/lib/data/aircraft";
import { duration, longDate, money } from "@/lib/format";
import { isLive, viewLeg } from "@/lib/legs";
import { useApp, useHydrated, useLiveLegs } from "@/store/app-store";

export function LegDetail() {
  const id = useSearchParams().get("id") ?? "";
  const ready = useHydrated();
  const leg = useApp((s) => s.emptyLegs.find((l) => l.id === id));
  const fleet = useApp((s) => s.fleet);
  const operators = useApp((s) => s.operators);
  const live = useLiveLegs();
  const view = useMemo(() => (leg ? viewLeg(leg, fleet, operators) : null), [leg, fleet, operators]);

  if (!ready) return <SkeletonList count={2} />;
  if (!view) {
    return (
      <EmptyState
        title="Flight not found"
        body="This empty leg may have been withdrawn by the operator."
        action={<LinkButton href="/empty-legs/">See all empty legs</LinkButton>}
      />
    );
  }

  const bookable = isLive(view.leg);
  const { leg: l, type } = view;
  const nearby = live
    .filter((v) => v.leg.id !== l.id && (v.from.region === view.from.region || v.leg.from === l.to))
    .slice(0, 3);

  const facts = [
    { icon: Calendar, label: "Date", value: longDate(l.date) },
    { icon: Clock, label: "Departs", value: l.flexHours ? `${l.time} local · ±${l.flexHours}h window` : `${l.time} local` },
    { icon: Gauge, label: "Flight time", value: `~${duration(view.hours)} · ${view.distanceNm.toLocaleString()} nm` },
    { icon: Users, label: "Seats", value: `Up to ${type.seats} guests` },
    { icon: Luggage, label: "Baggage", value: `${type.baggageCuFt} ft³` },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/empty-legs/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Empty legs
        </Link>
        <ShareButton title={`${view.from.city} → ${view.to.city} for ${money(l.price)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="rounded-3xl bg-ink p-6 text-white sm:p-9">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gold px-3 py-1 text-[12px] font-semibold">{view.discountPct}% below charter</span>
              <span className="rounded-full border border-white/20 px-3 py-1 text-[12px] text-white/70">
                {CATEGORY_LABELS[type.category]}
              </span>
            </div>
            <div className="mt-8">
              <RouteLine from={l.from} to={l.to} hours={view.hours} size="lg" invert />
            </div>
            <p className="mt-6 text-[14px] text-white/60">
              {view.from.name} → {view.to.name}
            </p>
          </section>

          <Card className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            {facts.map((f) => (
              <div key={f.label} className="flex gap-3">
                <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-subtle" strokeWidth={1.8} />
                <div>
                  <p className="text-[12px] text-subtle">{f.label}</p>
                  <p className="text-[15px]">{f.value}</p>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5 sm:p-6">
            <p className="eyebrow">Aircraft</p>
            <p className="mt-1 text-[22px] font-semibold tracking-tight">{type.name}</p>
            <p className="text-[14px] text-muted">
              {type.manufacturer}
              {view.fleet ? ` · ${view.fleet.yearOfManufacture} · ${view.fleet.tail}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {type.amenities.map((a) => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
            {view.operator && (
              <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[14px]">
                <BadgeCheck className={view.operator.verified ? "h-4 w-4 text-success" : "h-4 w-4 text-subtle"} />
                Operated by {view.operator.name} · {view.operator.safetyRating}
              </p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <p className="eyebrow flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> How empty legs work
            </p>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-ink-2">
              {[
                "You charter the entire aircraft. The price covers every seat, crew, fuel, taxes and fees.",
                `The route and date are fixed by the operator's next trip${l.flexHours ? `; departure can move up to ${l.flexHours}h either way` : ""}.`,
                "If the operator's primary trip cancels, we'll offer a comparable aircraft or refund you in full.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-6">
            <Price retail={view.retailPrice} price={l.price} />
            <Reserve id={l.id} bookable={bookable} className="mt-5 w-full" />
            <p className="mt-3 text-center text-[12px] text-subtle">No charge until the operator confirms.</p>
          </Card>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[22px] font-semibold tracking-tight">More empty legs nearby</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((v) => (
              <LegCard key={v.leg.id} view={v} />
            ))}
          </div>
        </section>
      )}

      {/* Phone reserve bar, docked above the tab bar */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Price retail={view.retailPrice} price={l.price} compact />
          <Reserve id={l.id} bookable={bookable} />
        </div>
      </div>
    </div>
  );
}

function Price({ retail, price, compact }: { retail: number; price: number; compact?: boolean }) {
  return (
    <div>
      <p className="text-[13px] text-subtle line-through">{money(retail)}</p>
      <p className={compact ? "text-[22px] font-semibold tracking-tight" : "text-[34px] font-semibold tracking-tight"}>
        {money(price)}
      </p>
      {!compact && <p className="text-[13px] text-muted">Entire aircraft · all-in</p>}
    </div>
  );
}

function Reserve({ id, bookable, className }: { id: string; bookable: boolean; className?: string }) {
  if (!bookable) {
    return <span className={`inline-flex h-11 items-center justify-center rounded-full bg-black/5 px-5 text-[14px] text-muted ${className ?? ""}`}>No longer available</span>;
  }
  return (
    <LinkButton href={`/charter/book/?leg=${id}`} className={className}>
      Reserve flight
    </LinkButton>
  );
}

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          await navigator.share({ title, url }).catch(() => {});
          return;
        }
        await navigator.clipboard?.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-ink-2 hover:border-line-strong"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Share className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
