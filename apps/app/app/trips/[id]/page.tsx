"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api, type EmptyLeg, type MatchResult, type Trip } from "@/lib/api";
import { useMe } from "@/hooks/me";
import { useAction, useApi } from "@/hooks/use-api";
import { acceptedQuote, currentStageIndex, formatLegDeparture, STATUS_LABEL, tripTitle } from "@/lib/rules";
import { ActionError, Banner, Card, EntitlementGate, ErrorState, StatusChip } from "@/components/ui";
import { PageSkeleton } from "@/components/Shell";
import { StageRail } from "@/components/trip/StageRail";
import { MatchSection } from "@/components/trip/MatchSection";
import { RfqSection } from "@/components/trip/RfqSection";
import { QuotesSection } from "@/components/trip/QuotesSection";
import { ContractSection, PaymentSection } from "@/components/trip/ContractPayment";
import { ManifestSection } from "@/components/trip/ManifestSection";
import { FlightSection } from "@/components/trip/FlightSection";
import { GroundSection } from "@/components/trip/GroundSection";

function RouteSummary({ trip }: { trip: Trip }) {
  const match = useApi<MatchResult>(`match-dist:${trip.id}`, () => api.match(trip.id));
  const dist = match.data?.legs;
  return (
    <Card id="request" num="01" title="Request" flush>
      <div className="legs">
        {trip.legs.map((l, i) => (
          <div className="leg" key={i}>
            <span className="seq">{i + 1}</span>
            <span className="route"><span className="mono">{l.origin_icao}</span> <span className="muted small">{l.origin.name}</span> to <span className="mono">{l.destination_icao}</span> <span className="muted small">{l.destination.name}</span></span>
            <span className="muted">
              {formatLegDeparture(l)}
              {" · "}
              {dist?.[i]?.distance_nm ? <span className="mono">{dist[i].distance_nm.toLocaleString("en-US")} nm</span> : match.loading ? "…" : "distance n/a"}
            </span>
          </div>
        ))}
      </div>
      <div className="card-b" style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 32px" }}>
          {([["Passengers", trip.passengers], ["Checked bags", trip.checked_bags], ["Carry-on", trip.carry_on_bags], ["Golf bags", trip.golf_bags], ["Ski bags", trip.ski_bags]] as const).map(([l, v]) => (
            <div key={l}><div className="eyebrow">{l}</div><div style={{ fontWeight: 500 }}>{v}</div></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EmptyLegCard({ trip, emptyLegId, listingId, onSent }: { trip: Trip; emptyLegId: string; listingId: string; onSent: () => void }) {
  const { me } = useMe();
  const legs = useApi<EmptyLeg[]>(`empty-legs:${me?.entitled ?? false}`, api.emptyLegs);
  const send = useAction(api.sendRfqs);
  const el = legs.data?.find((x) => x.id === emptyLegId);
  const sent = trip.rfqs.some((r) => r.listing?.listing_id === listingId);
  async function go() {
    const r = await send.run(trip.id, [listingId], emptyLegId);
    if (r) onSent();
  }
  return (
    <Card id="empty-leg" title="Empty leg request">
      <div style={{ display: "grid", gap: 12 }}>
        <p>
          {el ? <>The aircraft on this empty leg: <strong>{el.listing.type.manufacturer} {el.listing.type.model}</strong>{el.listing.tail_number ? <> <span className="mono">{el.listing.tail_number}</span></> : null}. </> : null}
          The RFQ goes to its operator, who quotes the flight. No price is listed for empty legs.
        </p>
        {!me?.entitled ? <EntitlementGate /> : sent ? <Banner tone="ok">RFQ sent for this empty leg.</Banner> : (
          <div><button className="btn btn-primary" onClick={go} disabled={send.pending}>{send.pending ? "Sending" : "Send RFQ for this empty leg"}</button></div>
        )}
        <ActionError error={send.error} />
      </div>
    </Card>
  );
}

function TripPageInner() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const emptyLegId = sp.get("empty_leg");
  const emptyLegListing = sp.get("listing");
  const q = useApi<Trip>(`trip:${id}`, () => api.trip(id), { refreshMs: 4000, poll: (t) => t.status === "rfq_sent" });
  const cancel = useAction(api.cancelTrip);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (q.error) return <ErrorState error={q.error} onRetry={q.reload} />;
  if (!q.data) return <PageSkeleton />;
  const trip = q.data;
  const cur = currentStageIndex(trip);
  const cancelled = trip.status === "cancelled";
  const accepted = acceptedQuote(trip);
  const canAddRfq = ["draft", "rfq_sent", "quoted"].includes(trip.status);
  const canCancel = !["in_flight", "completed", "cancelled"].includes(trip.status);

  async function doCancel() {
    const r = await cancel.run(trip.id);
    setConfirmCancel(false);
    if (r) q.reload();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <Link href="/trips" className="muted small" style={{ display: "inline-flex", gap: 4, alignItems: "center", minHeight: 24 }}><ArrowLeft size={14} aria-hidden /> Trips</Link>
        <div className="page-h" style={{ marginTop: 8, marginBottom: 0 }}>
          <div>
            <h1 className="mono" style={{ fontWeight: 500 }}>{tripTitle(trip)}</h1>
            <p className="muted"><span className="mono">{trip.id}</span> · {trip.passengers} passengers · {trip.trip_type.replace("_", " ")}</p>
          </div>
          <div className="actions">
            <StatusChip status={trip.status} />
            {canCancel ? (confirmCancel ? (
              <>
                <button className="btn btn-sm btn-danger" onClick={doCancel} disabled={cancel.pending}>Confirm cancel</button>
                <button className="btn btn-sm" onClick={() => setConfirmCancel(false)}>Keep trip</button>
              </>
            ) : <button className="btn btn-sm" onClick={() => setConfirmCancel(true)}>Cancel trip</button>) : null}
          </div>
        </div>
      </div>
      <ActionError error={cancel.error} />
      {cancelled ? <Banner tone="problem">This trip is cancelled.</Banner> : <StageRail current={cur} cancelled={false} />}
      <div aria-live="polite" className="sr-only">Trip status: {STATUS_LABEL[trip.status]}</div>

      <RouteSummary trip={trip} />
      {!cancelled ? (
        <>
          {emptyLegId && emptyLegListing && canAddRfq ? <EmptyLegCard trip={trip} emptyLegId={emptyLegId} listingId={emptyLegListing} onSent={q.reload} /> : null}
          {canAddRfq ? <MatchSection trip={trip} onSent={q.reload} emptyLegId={null} /> : <Card id="aircraft" num="02" title="Aircraft"><p className="muted">Aircraft selection is complete.</p></Card>}
          <RfqSection trip={trip} />
          <QuotesSection trip={trip} onChange={q.reload} />
          <ContractSection trip={trip} locked={!accepted} onChange={q.reload} />
          <PaymentSection trip={trip} locked={!accepted || !accepted.contract?.acknowledged_at} onChange={q.reload} />
          <ManifestSection trip={trip} locked={!["paid", "manifest_due", "scheduled", "in_flight", "completed"].includes(trip.status)} onChange={q.reload} />
          <FlightSection trip={trip} locked={!["scheduled", "in_flight", "completed"].includes(trip.status)} />
          {accepted ? <GroundSection trip={trip} /> : null}
        </>
      ) : null}
    </div>
  );
}

export default function TripPage() {
  return <Suspense><TripPageInner /></Suspense>;
}
