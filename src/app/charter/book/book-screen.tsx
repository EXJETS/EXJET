"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Gate } from "@/components/gate";
import { PriceBreakdown } from "@/components/price-breakdown";
import { RouteLine } from "@/components/route";
import { Button, Card, Counter, EmptyState, Field, Input, LinkButton, SkeletonList, Textarea } from "@/components/ui";
import { CATEGORY_LABELS, getAircraftType } from "@/lib/data/aircraft";
import { estimateSegment, quoteCharter } from "@/lib/flight";
import { cn, duration, longDate, plural } from "@/lib/format";
import { decodeItinerary, encodeItinerary } from "@/lib/itinerary";
import { viewLeg } from "@/lib/legs";
import type { AircraftType, Passenger, Quote, Segment, User } from "@/lib/types";
import { useApp, useHydrated } from "@/store/app-store";

interface Draft {
  kind: "charter" | "empty-leg";
  type: AircraftType;
  segments: Segment[];
  pax: number;
  paxLocked: boolean;
  emptyLegId?: string;
  operatorId?: string;
  quote: (pax: number) => Quote | null;
  backHref: string;
}

function useDraft(): Draft | null | "loading" {
  const params = useSearchParams();
  const ready = useHydrated();
  const emptyLegs = useApp((s) => s.emptyLegs);
  const fleet = useApp((s) => s.fleet);
  const operators = useApp((s) => s.operators);

  return useMemo(() => {
    const legId = params.get("leg");
    if (legId) {
      if (!ready) return "loading";
      const leg = emptyLegs.find((l) => l.id === legId);
      const view = leg && viewLeg(leg, fleet, operators);
      if (!view || leg.status !== "available") return null;
      const fixed: Quote = {
        lines: [{ label: "Empty leg · entire aircraft, taxes & fees included", amount: leg.price }],
        total: leg.price,
      };
      return {
        kind: "empty-leg",
        type: view.type,
        segments: [{ from: leg.from, to: leg.to, date: leg.date, time: leg.time }],
        pax: Math.min(2, view.type.seats),
        paxLocked: false,
        emptyLegId: leg.id,
        operatorId: leg.operatorId,
        quote: (pax) => (pax <= view.type.seats ? fixed : null),
        backHref: `/empty-legs/view/?id=${leg.id}`,
      };
    }
    const it = decodeItinerary(new URLSearchParams(params.toString()));
    const type = getAircraftType(params.get("type") ?? "");
    if (!it || !type) return null;
    return {
      kind: "charter",
      type,
      segments: it.segments,
      pax: it.pax,
      paxLocked: true,
      quote: (pax) => quoteCharter(type.id, it.segments, pax),
      backHref: `/charter/?${encodeItinerary(it)}`,
    };
  }, [params, ready, emptyLegs, fleet, operators]);
}

export function BookScreen() {
  const live = useDraft();
  const params = useSearchParams();
  const key = params.toString();
  // Hold on to the draft once resolved: booking an empty leg marks it "booked",
  // which would otherwise flip this screen to "no longer available" mid-redirect.
  const [held, setHeld] = useState<{ key: string; draft: Draft } | null>(null);
  useEffect(() => {
    if (live && live !== "loading" && held?.key !== key) setHeld({ key, draft: live });
  }, [live, key, held]);
  const draft = held?.key === key ? held.draft : live;

  if (draft === "loading") return <SkeletonList />;
  if (!draft) {
    return (
      <EmptyState
        title="This flight is no longer available"
        body="It may have just been booked. Here are the latest empty legs and charter options."
        action={<LinkButton href="/empty-legs/">Browse empty legs</LinkButton>}
      />
    );
  }
  return (
    <Gate next={`/charter/book/?${params.toString()}`}>{(user) => <BookingForm draft={draft} user={user} />}</Gate>
  );
}

const blankPassenger: Passenger = { firstName: "", lastName: "", dateOfBirth: "", nationality: "" };

function BookingForm({ draft, user }: { draft: Draft; user: User }) {
  const router = useRouter();
  const createBooking = useApp((s) => s.createBooking);
  const [step, setStep] = useState<"details" | "review">("details");
  const [pax, setPax] = useState(draft.pax);
  const [contact, setContact] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [lead, setLead] = useState<Passenger>(() => {
    const [firstName = "", ...rest] = user.name.split(" ");
    return { ...blankPassenger, firstName, lastName: rest.join(" ") };
  });
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const quote = draft.quote(pax);
  const detailsValid = contact.name.trim() && /\S+@\S+\.\S+/.test(contact.email) && contact.phone.trim() && lead.firstName.trim() && lead.lastName.trim();

  const confirm = () => {
    if (!quote) return;
    setSubmitting(true);
    const res = createBooking({
      kind: draft.kind,
      emptyLegId: draft.emptyLegId,
      operatorId: draft.operatorId,
      typeId: draft.type.id,
      segments: draft.segments,
      pax,
      passengers: [lead],
      contact,
      notes: notes.trim(),
      quote,
    });
    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    router.push(`/trips/view/?id=${res.id}&new=1`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <Link href={step === "review" ? "#" : draft.backHref} onClick={(e) => {
          if (step === "review") {
            e.preventDefault();
            setStep("details");
          }
        }} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <ol className="flex gap-2 text-[13px]">
          {(["details", "review"] as const).map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1",
                step === s ? "bg-ink text-white" : "bg-surface text-muted"
              )}
            >
              <span className="font-mono text-[11px]">{i + 1}</span>
              {s === "details" ? "Guest details" : "Review & request"}
            </li>
          ))}
        </ol>

        {step === "details" ? (
          <>
            <Card className="space-y-4 p-5 sm:p-6">
              <h2 className="text-[17px] font-semibold">Contact</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" className="sm:col-span-2">
                  <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
                </Field>
                <Field label="Mobile" hint="Your crew will text you on the day.">
                  <Input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" />
                </Field>
              </div>
            </Card>

            <Card className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[17px] font-semibold">Passengers</h2>
                {draft.paxLocked ? (
                  <span className="text-[13px] text-muted">{plural(pax, "guest")}</span>
                ) : (
                  <div className="w-36">
                    <Counter value={pax} max={draft.type.seats} onChange={setPax} label="passengers" />
                  </div>
                )}
              </div>
              <p className="text-[13px] text-muted">
                Lead passenger now — add the rest of the manifest from your trip page any time before departure.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name (as on passport)">
                  <Input value={lead.firstName} onChange={(e) => setLead({ ...lead, firstName: e.target.value })} />
                </Field>
                <Field label="Last name">
                  <Input value={lead.lastName} onChange={(e) => setLead({ ...lead, lastName: e.target.value })} />
                </Field>
                <Field label="Date of birth">
                  <Input type="date" value={lead.dateOfBirth} onChange={(e) => setLead({ ...lead, dateOfBirth: e.target.value })} />
                </Field>
                <Field label="Nationality">
                  <Input value={lead.nationality} onChange={(e) => setLead({ ...lead, nationality: e.target.value })} placeholder="e.g. United States" />
                </Field>
              </div>
            </Card>

            <Card className="space-y-4 p-5 sm:p-6">
              <h2 className="text-[17px] font-semibold">Requests</h2>
              <Field label="Catering, ground transport, pets, luggage" hint="Optional — your concierge will confirm everything.">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Sushi for 4, car from FBO to hotel, one small dog" />
              </Field>
            </Card>

            <Button size="lg" className="w-full sm:w-auto" disabled={!detailsValid || !quote} onClick={() => setStep("review")}>
              Continue to review
            </Button>
          </>
        ) : (
          <>
            <Card className="divide-y divide-line">
              {draft.segments.map((s, i) => (
                <div key={i} className="p-5">
                  <p className="eyebrow mb-3">
                    {draft.segments.length > 1 ? `Flight ${i + 1} · ` : ""}
                    {longDate(s.date)} · {s.time}
                  </p>
                  <RouteLine from={s.from} to={s.to} hours={estimateSegment(draft.type, s.from, s.to).hours} />
                </div>
              ))}
            </Card>
            <Card className="grid gap-3 p-5 text-[14px] sm:grid-cols-2">
              <Row label="Aircraft" value={`${draft.type.name} · ${CATEGORY_LABELS[draft.type.category]}`} />
              <Row label="Guests" value={String(pax)} />
              <Row label="Lead passenger" value={`${lead.firstName} ${lead.lastName}`} />
              <Row label="Contact" value={`${contact.email} · ${contact.phone}`} />
              {notes && <Row label="Requests" value={notes} wide />}
            </Card>
            <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-[13px] leading-relaxed text-ink-2">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#14120f]" />
              <span>
                I agree to the charter terms.{" "}
                {draft.kind === "empty-leg"
                  ? "Empty legs depend on the operator's primary trip: if it moves, departure can shift within the stated window; if it cancels, I'll be offered a comparable aircraft or a full refund."
                  : "Free cancellation until the operator confirms. After confirmation, cancellation fees follow the operator's schedule."}
              </span>
            </label>
            {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
            <Button size="lg" className="w-full sm:w-auto" disabled={!agreed || submitting} onClick={confirm}>
              <Check className="h-4 w-4" /> Request booking
            </Button>
          </>
        )}
      </div>

      <aside>
        <Card className="space-y-4 p-5 lg:sticky lg:top-24">
          <div>
            <p className="eyebrow">{draft.kind === "empty-leg" ? "Empty leg" : "Charter"}</p>
            <p className="mt-1 text-[19px] font-semibold tracking-tight">{draft.type.name}</p>
            <p className="text-[13px] text-muted">
              {plural(draft.segments.length, "flight")} ·{" "}
              {duration(draft.segments.reduce((h, s) => h + estimateSegment(draft.type, s.from, s.to).hours, 0))}
            </p>
          </div>
          {quote ? (
            <PriceBreakdown quote={quote} note="Nothing is charged until the operator confirms your aircraft." />
          ) : (
            <p className="text-[13px] text-danger">Too many passengers for this aircraft.</p>
          )}
          <p className="flex items-start gap-2 border-t border-line pt-4 text-[12px] leading-relaxed text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
            Flown by a vetted, certificated operator with audited safety ratings.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[12px] text-subtle">{label}</p>
      <p className="mt-0.5 break-words">{value}</p>
    </div>
  );
}
