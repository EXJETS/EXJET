"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api, type MatchResult, type Trip } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { acceptedQuote, currentStageIndex, formatWhen, STATUS_LABEL, tripTitle } from "@/lib/rules";
import { ActionError, Banner, Card, ErrorState, StatusChip } from "@/components/ui";
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
            <span className="route"><span className="mono">{l.origin_icao}</span> to <span className="mono">{l.destination_icao}</span></span>
            <span className="muted">
              {formatWhen(l.depart_at)}
              {" · "}
              {dist?.[i] ? <span className="mono">{dist[i].distance_nm.toLocaleString("en-US")} nm</span> : match.loading ? "…" : "distance n/a"}
            </span>
          </div>
        ))}
      </div>
      <div className="card-b" style={{ borderTop: "1px solid var(--line)" }}>
        <dl className="kv" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, max-content))", gap: "4px 24px" }}>
          <dt>Passengers</dt><dd>{trip.passengers}</dd>
          <dt>Checked</dt><dd>{trip.checked_bags}</dd>
          <dt>Carry-on</dt><dd>{trip.carry_on_bags}</dd>
          <dt>Golf</dt><dd>{trip.golf_bags}</dd>
          <dt>Ski</dt><dd>{trip.ski_bags}</dd>
        </dl>
      </div>
    </Card>
  );
}

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
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
          {canAddRfq ? <MatchSection trip={trip} onSent={q.reload} /> : <Card id="aircraft" num="02" title="Aircraft"><p className="muted">Aircraft selection is complete.</p></Card>}
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
