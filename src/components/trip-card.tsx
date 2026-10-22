import Link from "next/link";
import { RouteLine } from "@/components/route";
import { StatusBadge } from "@/components/ui";
import { getAircraftType } from "@/lib/data/aircraft";
import { money, plural, shortDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function TripCard({ booking, href }: { booking: Booking; href: string }) {
  const first = booking.segments[0];
  const last = booking.segments[booking.segments.length - 1];
  const roundTrip = booking.segments.length === 2 && first.from === last.to;
  return (
    <Link href={href} className="block rounded-2xl border border-line bg-surface p-5 transition hover:border-line-strong active:scale-[0.99]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[12px] text-muted">{booking.ref}</span>
        <StatusBadge status={booking.status} />
      </div>
      <RouteLine from={first.from} to={roundTrip ? first.to : last.to} />
      <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-[13px] text-ink-2">
        <span>
          {shortDate(first.date)}
          {booking.segments.length > 1 ? ` – ${shortDate(last.date)}` : ""} ·{" "}
          {getAircraftType(booking.typeId)?.name} · {plural(booking.pax, "guest")}
        </span>
        <span className="font-medium">{money(booking.quote.total)}</span>
      </div>
    </Link>
  );
}
