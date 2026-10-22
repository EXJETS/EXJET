"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Phone, Plus } from "lucide-react";
import { Gate } from "@/components/gate";
import { PriceBreakdown } from "@/components/price-breakdown";
import { RouteLine } from "@/components/route";
import { Button, Card, EmptyState, Field, Input, LinkButton, StatusBadge } from "@/components/ui";
import { CATEGORY_LABELS, getAircraftType } from "@/lib/data/aircraft";
import { estimateSegment } from "@/lib/flight";
import { longDate, today } from "@/lib/format";
import type { Booking, Passenger } from "@/lib/types";
import { useApp } from "@/store/app-store";

export function TripDetail() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const justBooked = params.get("new") === "1";
  const booking = useApp((s) => s.bookings.find((b) => b.id === id));

  return (
    <Gate next={`/trips/view/?id=${id}`}>
      {(user) =>
        !booking || (booking.userId !== user.id && user.role === "client") ? (
          <EmptyState title="Trip not found" action={<LinkButton href="/trips/">Back to trips</LinkButton>} />
        ) : (
          <Trip booking={booking} justBooked={justBooked} />
        )
      }
    </Gate>
  );
}

function Trip({ booking, justBooked }: { booking: Booking; justBooked: boolean }) {
  const cancelBooking = useApp((s) => s.cancelBooking);
  const operator = useApp((s) => s.operators.find((o) => o.id === booking.operatorId));
  const [confirmCancel, setConfirmCancel] = useState(false);
  const type = getAircraftType(booking.typeId);
  const cancellable =
    (booking.status === "requested" || booking.status === "confirmed") && booking.segments[0].date >= today();

  return (
    <div className="space-y-5">
      <Link href="/trips/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Trips
      </Link>

      {justBooked && booking.status === "requested" && (
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-[14px] leading-relaxed">
            <p className="font-semibold">Request received — {booking.ref}</p>
            <p>
              We&apos;re confirming the aircraft with the operator now. You&apos;ll get a confirmation by email and text,
              usually within the hour.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[13px] text-muted">{booking.ref}</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
            {booking.kind === "empty-leg" ? "Empty leg" : "Charter"} · {type?.name}
          </h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <Card className="divide-y divide-line">
        {booking.segments.map((s, i) => (
          <div key={i} className="p-5">
            <p className="eyebrow mb-3">
              {booking.segments.length > 1 ? `Flight ${i + 1} · ` : ""}
              {longDate(s.date)} · {s.time}
            </p>
            <RouteLine from={s.from} to={s.to} hours={type ? estimateSegment(type, s.from, s.to).hours : undefined} />
          </div>
        ))}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="space-y-3 p-5 text-[14px]">
          <p className="eyebrow">Aircraft & crew</p>
          <p>
            {type?.name} · {type && CATEGORY_LABELS[type.category]}
          </p>
          <p className="text-muted">
            {operator
              ? `Operated by ${operator.name} (${operator.safetyRating}).`
              : "Operator and tail number are assigned on confirmation."}
          </p>
          {booking.notes && (
            <p className="rounded-xl bg-canvas p-3 text-ink-2">
              <span className="text-subtle">Requests: </span>
              {booking.notes}
            </p>
          )}
        </Card>
        <Card className="p-5">
          <p className="eyebrow mb-3">Price</p>
          <PriceBreakdown quote={booking.quote} />
        </Card>
      </div>

      <Manifest booking={booking} />

      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-muted">Questions about this trip? Our concierge is available 24/7.</p>
        <a href="tel:+18005550199" className="inline-flex items-center gap-2 text-[14px] font-medium">
          <Phone className="h-4 w-4" /> +1 800 555 0199
        </a>
      </Card>

      {cancellable &&
        (confirmCancel ? (
          <Card className="space-y-3 border-red-200 p-5">
            <p className="text-[14px]">
              Cancel {booking.ref}?{" "}
              {booking.status === "confirmed"
                ? "Confirmed trips may incur the operator's cancellation fee."
                : "No fee — the operator hasn't confirmed yet."}
            </p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => cancelBooking(booking.id)}>
                Yes, cancel trip
              </Button>
              <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
                Keep trip
              </Button>
            </div>
          </Card>
        ) : (
          <Button variant="ghost" className="text-danger" onClick={() => setConfirmCancel(true)}>
            Cancel trip
          </Button>
        ))}
    </div>
  );
}

function Manifest({ booking }: { booking: Booking }) {
  const addPassenger = useApp((s) => s.addPassenger);
  const [draft, setDraft] = useState<Passenger | null>(null);
  const editable = booking.status === "requested" || booking.status === "confirmed";
  const room = booking.passengers.length < booking.pax;

  const save = () => {
    if (!draft) return;
    addPassenger(booking.id, draft);
    setDraft(null);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          Passenger manifest · {booking.passengers.length}/{booking.pax}
        </p>
        {editable && room && !draft && (
          <Button size="sm" variant="secondary" onClick={() => setDraft({ firstName: "", lastName: "", dateOfBirth: "", nationality: "" })}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        )}
      </div>
      <ul className="mt-3 divide-y divide-line text-[14px]">
        {booking.passengers.map((p, i) => (
          <li key={i} className="flex justify-between py-2.5">
            <span>
              {p.firstName} {p.lastName}
            </span>
            <span className="text-muted">{i === 0 ? "Lead" : p.nationality}</span>
          </li>
        ))}
        {booking.passengers.length === 0 && <li className="py-2.5 text-muted">No passengers added yet.</li>}
      </ul>
      {draft && (
        <div className="mt-3 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <Field label="First name">
            <Input value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
          </Field>
          <Field label="Last name">
            <Input value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={draft.dateOfBirth} onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })} />
          </Field>
          <Field label="Nationality">
            <Input value={draft.nationality} onChange={(e) => setDraft({ ...draft, nationality: e.target.value })} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save} disabled={!draft.firstName.trim() || !draft.lastName.trim()}>
              Save passenger
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
