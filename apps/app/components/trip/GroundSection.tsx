"use client";

import { useState } from "react";
import { api, type Trip } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { ActionError, Banner, Card, Field } from "../ui";

export function GroundSection({ trip }: { trip: Trip }) {
  const [kind, setKind] = useState<"rental_car" | "chauffeur">("rental_car");
  const [leg, setLeg] = useState("0");
  const [fbo, setFbo] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const req = useAction(api.groundRfq);
  const existing = trip.rfqs.filter((r) => r.kind === "rental_car" || r.kind === "chauffeur");

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await req.run(trip.id, { kind, leg_sequence: Number(leg), fbo_id: fbo.trim(), details: details.trim() });
    if (r) {
      setSent(r.reference);
      setDetails("");
    }
  }
  return (
    <Card id="ground" title="Ground transportation" actions={<span className="muted small">Request at the FBO</span>}>
      <form onSubmit={go} style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <div role="radiogroup" aria-label="Service" className="seg" style={{ width: "fit-content" }}>
          <button type="button" role="radio" aria-checked={kind === "rental_car"} onClick={() => setKind("rental_car")}>Rental car</button>
          <button type="button" role="radio" aria-checked={kind === "chauffeur"} onClick={() => setKind("chauffeur")}>Chauffeur</button>
        </div>
        <div className="row">
          <Field label="Leg" id="g-leg">
            <select id="g-leg" className="select" value={leg} onChange={(e) => setLeg(e.target.value)}>
              {trip.legs.map((l, i) => <option key={i} value={i}>Leg {i + 1}: {l.origin_icao} to {l.destination_icao}</option>)}
            </select>
          </Field>
          <Field label="FBO identifier" id="g-fbo" help="As given in the operator's handling details"><input id="g-fbo" className="input" required value={fbo} onChange={(e) => setFbo(e.target.value)} /></Field>
        </div>
        <Field label="Details" id="g-details"><textarea id="g-details" className="textarea" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Pickup time, number of people, vehicle preference" /></Field>
        <ActionError error={req.error} />
        {sent ? <Banner tone="ok" live>Request sent. Reference <span className="mono">{sent}</span>.</Banner> : null}
        <div><button className="btn btn-primary" disabled={req.pending || !fbo.trim()}>{req.pending ? "Sending" : "Send request"}</button></div>
      </form>
      {existing.length ? <p className="muted small" style={{ marginTop: 12 }}>Sent: {existing.map((r) => `${r.reference} (${r.kind === "rental_car" ? "rental car" : "chauffeur"}, ${r.status})`).join("; ")}</p> : null}
    </Card>
  );
}
