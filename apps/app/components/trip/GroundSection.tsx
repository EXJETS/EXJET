"use client";

import { useState } from "react";
import { api, type Fbo, type Trip } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { ActionError, Async, Banner, Card, Field } from "../ui";

export function GroundSection({ trip }: { trip: Trip }) {
  const [kind, setKind] = useState<"rental_car" | "chauffeur">("rental_car");
  const [leg, setLeg] = useState("0");
  const [where, setWhere] = useState<"destination" | "origin">("destination");
  const [fbo, setFbo] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const req = useAction(api.groundRfq);
  const existing = trip.rfqs.filter((r) => r.kind === "rental_car" || r.kind === "chauffeur");
  const l = trip.legs[Number(leg)] ?? trip.legs[0];
  const icao = where === "origin" ? l.origin_icao : l.destination_icao;
  const fbos = useApi<Fbo[]>(`fbos:${icao}`, () => api.fbos(icao));

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await req.run(trip.id, { kind, leg_sequence: Number(leg), fbo_id: fbo, details: details.trim() || null });
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
            <select id="g-leg" className="select" value={leg} onChange={(e) => { setLeg(e.target.value); setFbo(""); }}>
              {trip.legs.map((x, i) => <option key={i} value={i}>Leg {i + 1}: {x.origin_icao} to {x.destination_icao}</option>)}
            </select>
          </Field>
          <Field label="Airport" id="g-where">
            <select id="g-where" className="select" value={where} onChange={(e) => { setWhere(e.target.value as "origin" | "destination"); setFbo(""); }}>
              <option value="destination">Arrival: {l.destination_icao}</option>
              <option value="origin">Departure: {l.origin_icao}</option>
            </select>
          </Field>
        </div>
        <Async q={fbos} skeleton={<div className="skeleton" style={{ height: 38 }} />}>
          {(list) => list.length === 0 ? <Banner tone="wait">No FBOs are listed for {icao} yet.</Banner> : (
            <Field label="FBO" id="g-fbo">
              <select id="g-fbo" className="select" required value={fbo} onChange={(e) => setFbo(e.target.value)}>
                <option value="">Choose an FBO</option>
                {list.map((f) => <option key={f.id} value={f.id}>{f.name}{f.phone ? ` · ${f.phone}` : ""}</option>)}
              </select>
            </Field>
          )}
        </Async>
        <Field label="Details" id="g-details" help={`${details.length}/500. Links and email addresses are removed before sending.`}>
          <textarea id="g-details" className="textarea" maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Pickup time, number of people, vehicle preference" />
        </Field>
        <ActionError error={req.error} />
        {sent ? <Banner tone="ok" live>Request sent. Reference <span className="mono">{sent}</span>.</Banner> : null}
        <div><button className="btn btn-primary" disabled={req.pending || !fbo}>{req.pending ? "Sending" : "Send request"}</button></div>
      </form>
      {existing.length ? <p className="muted small" style={{ marginTop: 12 }}>Sent: {existing.map((r) => `${r.reference} (${r.kind === "rental_car" ? "rental car" : "chauffeur"}, ${r.status})`).join("; ")}</p> : null}
    </Card>
  );
}
