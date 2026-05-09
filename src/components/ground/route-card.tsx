import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteCardProps {
  route: {
    id: string;
    from: { city: string; place: string; code: string };
    to: { city: string; place: string; code: string };
    distanceMiles: number;
    estimatedMinutes: number;
    fromPrice: number;
    demand: string;
  };
  className?: string;
}

export function RouteCard({ route, className }: RouteCardProps) {
  return (
    <Link
      href={`/ground/book?from=${encodeURIComponent(route.from.place)}&to=${encodeURIComponent(route.to.place)}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-[var(--color-hairline)] bg-white p-6 transition-all hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.3)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
          Ground Transfer
        </span>
        {route.demand === "very_high" && (
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-bordeaux)]">
            In demand
          </span>
        )}
      </div>

      <div className="mt-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {route.from.city}
          </div>
          <div className="mt-1 truncate font-serif text-[17px] leading-tight text-[var(--color-ink)]">
            {route.from.place}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1 self-center px-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
          <ArrowRight className="h-3 w-3 text-champagne transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
        </div>
        <div className="min-w-0 text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {route.to.city}
          </div>
          <div className="mt-1 truncate font-serif text-[17px] leading-tight text-[var(--color-ink)]">
            {route.to.place}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 border-t border-[var(--color-hairline)] pt-4 text-[11px] text-[var(--color-muted)]">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-champagne" strokeWidth={1.75} />
          {route.estimatedMinutes} min
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-champagne" strokeWidth={1.75} />
          {route.distanceMiles} mi
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-[var(--color-hairline)] pt-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne">From</span>
          <div className="font-serif text-[24px] leading-none text-[var(--color-ink)]">
            ${route.fromPrice}
          </div>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors group-hover:text-champagne">
          Book
        </span>
      </div>
    </Link>
  );
}
