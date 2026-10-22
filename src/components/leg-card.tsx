import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";
import { RouteLine } from "@/components/route";
import { CATEGORY_LABELS } from "@/lib/data/aircraft";
import { money, shortDate } from "@/lib/format";
import type { LegView } from "@/lib/legs";

export function LegCard({ view }: { view: LegView }) {
  const { leg, type } = view;
  return (
    <Link
      href={`/empty-legs/view/?id=${leg.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.3)] active:scale-[0.99]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-semibold text-white">
          {view.discountPct}% off
        </span>
        <span className="truncate text-[12px] text-muted">
          {type.name} · {CATEGORY_LABELS[type.category]}
        </span>
      </div>
      <RouteLine from={leg.from} to={leg.to} hours={view.hours} />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-[13px] text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-subtle" strokeWidth={1.8} />
          {shortDate(leg.date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-subtle" strokeWidth={1.8} />
          {leg.time}
          {leg.flexHours ? ` ±${leg.flexHours}h` : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-subtle" strokeWidth={1.8} />
          {type.seats} seats
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[12px] text-subtle line-through">{money(view.retailPrice)}</p>
          <p className="text-[24px] font-semibold tracking-tight">{money(leg.price)}</p>
        </div>
        <span className="text-[13px] font-medium text-ink underline-offset-4 group-hover:underline">View flight →</span>
      </div>
    </Link>
  );
}
