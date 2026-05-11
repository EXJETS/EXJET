"use client";

import { useEffect, useState } from "react";
import { MapPin, Car, CheckCircle, Navigation, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroundBookingStatus } from "@/types";

const STATUS_STEPS: { key: GroundBookingStatus; label: string; desc: string }[] = [
  { key: "confirmed", label: "Booking Confirmed", desc: "Your reservation is secured." },
  { key: "chauffeur_assigned", label: "Chauffeur Assigned", desc: "Your driver is confirmed and ready." },
  { key: "en_route", label: "Chauffeur En Route", desc: "Your driver is on the way to pick-up." },
  { key: "arrived", label: "Chauffeur Arrived", desc: "Your driver is waiting at the pick-up location." },
  { key: "in_progress", label: "Trip In Progress", desc: "You are on your way to the destination." },
  { key: "completed", label: "Trip Completed", desc: "We hope you enjoyed the ride." },
];

const STATUS_INDEX: Record<GroundBookingStatus, number> = {
  pending: -1,
  confirmed: 0,
  chauffeur_assigned: 1,
  en_route: 2,
  arrived: 3,
  in_progress: 4,
  completed: 5,
  cancelled: -1,
};

interface TripStatusTrackerProps {
  status: GroundBookingStatus;
  chauffeurName?: string;
  vehiclePlate?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  eta?: number;
  autoProgress?: boolean;
}

export function TripStatusTracker({
  status: initialStatus,
  chauffeurName,
  vehiclePlate,
  pickupAddress,
  dropoffAddress,
  eta,
  autoProgress = false,
}: TripStatusTrackerProps) {
  const [status, setStatus] = useState<GroundBookingStatus>(initialStatus);
  const currentIdx = STATUS_INDEX[status];

  useEffect(() => {
    if (!autoProgress) return;
    const intervals = [4000, 8000, 12000, 18000, 25000];
    const timers = STATUS_STEPS.map((step, i) =>
      setTimeout(() => setStatus(step.key), intervals[i] ?? 0)
    );
    return () => timers.forEach(clearTimeout);
  }, [autoProgress]);

  return (
    <div className="flex flex-col gap-6">
      {/* Map placeholder */}
      <div className="relative h-56 overflow-hidden rounded-2xl bg-[var(--color-ivory-deep)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,155,110,0.12),transparent_70%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex flex-col items-center gap-2">
            {status === "completed" ? (
              <CheckCircle className="h-8 w-8 text-[var(--color-forest)]" strokeWidth={1.5} />
            ) : (
              <Navigation className={cn("h-8 w-8 text-champagne", (status === "en_route" || status === "in_progress") && "animate-pulse")} strokeWidth={1.5} />
            )}
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {status === "completed" ? "Arrived" : status === "arrived" ? "At pick-up" : "Live view available in app"}
            </span>
          </div>
        </div>

        {pickupAddress && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-white/90 px-3 py-2 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.75} />
            <span className="max-w-[160px] truncate text-[11px] text-[var(--color-ink)]">{pickupAddress}</span>
          </div>
        )}
        {dropoffAddress && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-white/90 px-3 py-2 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-forest)]" strokeWidth={1.75} />
            <span className="max-w-[160px] truncate text-[11px] text-[var(--color-ink)]">{dropoffAddress}</span>
          </div>
        )}
      </div>

      {/* Chauffeur info */}
      {(chauffeurName || vehiclePlate) && currentIdx >= 1 && (
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-hairline)] bg-white p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-ivory-deep)]">
            <Car className="h-5 w-5 text-champagne" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="font-serif text-[17px] text-[var(--color-ink)]">{chauffeurName}</div>
            {vehiclePlate && (
              <div className="font-mono text-[11px] text-[var(--color-muted)]">{vehiclePlate}</div>
            )}
          </div>
          {eta && currentIdx < 4 && (
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-ivory-deep)] px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
              <span className="font-mono text-[12px] text-[var(--color-ink)]">{eta} min</span>
            </div>
          )}
        </div>
      )}

      {/* Progress steps */}
      <div className="flex flex-col gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-champagne bg-champagne"
                      : active
                      ? "border-champagne bg-white"
                      : "border-[var(--color-hairline-strong)] bg-white"
                  )}
                >
                  {done ? (
                    <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  ) : (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        active ? "bg-champagne animate-pulse" : "bg-[var(--color-hairline-strong)]"
                      )}
                    />
                  )}
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mt-1 w-0.5 flex-1 rounded-full transition-all",
                      done ? "bg-champagne/40" : "bg-[var(--color-hairline)]"
                    )}
                    style={{ minHeight: "24px" }}
                  />
                )}
              </div>
              <div className={cn("pb-5 pt-0.5", idx === STATUS_STEPS.length - 1 && "pb-0")}>
                <div
                  className={cn(
                    "font-mono text-[12px] uppercase tracking-[0.18em]",
                    active ? "text-[var(--color-ink)]" : done ? "text-champagne" : "text-[var(--color-subtle)]"
                  )}
                >
                  {step.label}
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--color-muted)]">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
