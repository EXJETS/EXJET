import { money } from "@/lib/format";
import type { Quote } from "@/lib/types";

export function PriceBreakdown({ quote, note }: { quote: Quote; note?: string }) {
  return (
    <div>
      <dl className="space-y-2 text-[14px]">
        {quote.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-4">
            <dt className="text-muted">{l.label}</dt>
            <dd className="tabular-nums">{money(l.amount)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-[14px] font-medium">Total</span>
        <span className="text-[22px] font-semibold tracking-tight tabular-nums">{money(quote.total)}</span>
      </div>
      {note && <p className="mt-2 text-[12px] leading-relaxed text-subtle">{note}</p>}
    </div>
  );
}
