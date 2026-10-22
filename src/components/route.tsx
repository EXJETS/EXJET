import { Plane } from "lucide-react";
import { getAirport } from "@/lib/data/airports";
import { cn, duration } from "@/lib/format";

/** Big "TEB ——✈—— VNY" route display. */
export function RouteLine({
  from,
  to,
  hours,
  size = "md",
  invert,
}: {
  from: string;
  to: string;
  hours?: number;
  size?: "md" | "lg";
  invert?: boolean;
}) {
  const a = getAirport(from);
  const b = getAirport(to);
  const code = size === "lg" ? "text-[40px] sm:text-[56px]" : "text-[28px]";
  const sub = invert ? "text-white/60" : "text-muted";
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0">
        <p className={cn("font-mono font-semibold leading-none tracking-tight", code)}>{a?.iata ?? from}</p>
        <p className={cn("mt-1.5 truncate text-[13px]", sub)}>{a?.city ?? from}</p>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1 pb-5">
        <div className="flex w-full items-center gap-2">
          <span className={cn("h-px flex-1", invert ? "bg-white/30" : "bg-line-strong")} />
          <Plane className={cn("h-4 w-4", invert ? "text-gold-soft" : "text-gold")} strokeWidth={1.8} />
          <span className={cn("h-px flex-1", invert ? "bg-white/30" : "bg-line-strong")} />
        </div>
        {hours !== undefined && <span className={cn("font-mono text-[11px]", sub)}>{duration(hours)}</span>}
      </div>
      <div className="min-w-0 text-right">
        <p className={cn("font-mono font-semibold leading-none tracking-tight", code)}>{b?.iata ?? to}</p>
        <p className={cn("mt-1.5 truncate text-[13px]", sub)}>{b?.city ?? to}</p>
      </div>
    </div>
  );
}
