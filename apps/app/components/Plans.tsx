"use client";

import { useState } from "react";
import { api, type Plan } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { ActionError, Async, Banner, Field } from "./ui";

export function Plans({ currentPlan }: { currentPlan?: string }) {
  const plans = useApi<Plan[]>("plans", api.plans);
  const checkout = useAction(api.checkout);
  const [busy, setBusy] = useState<string | null>(null);
  const [inq, setInq] = useState(false);

  async function go(plan: string) {
    setBusy(plan);
    const r = await checkout.run(plan);
    if (r) window.location.assign(r.checkout_url);
    else setBusy(null);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Async q={plans}>
        {(list) => (
          <div className="plans">
            {list.filter((p) => !p.inquiry_only && p.unit_amount_cents !== null).map((p) => (
              <section key={p.plan} className="card plan" aria-label={`${p.name} plan`}>
                <div className="card-b" style={{ flex: 1 }}>
                  <div className="eyebrow">{p.name}</div>
                  <p className="price">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format((p.unit_amount_cents ?? 0) / 100)}
                    <span className="muted small" style={{ fontWeight: 400 }}> / month</span>
                  </p>
                  <ul>
                    <li>{p.seats ?? 1} {p.seats === 1 ? "seat" : "seats"}</li>
                    <li>Send RFQs to verified operators</li>
                    <li>Operator, tail and contact details</li>
                  </ul>
                </div>
                <div className="card-f">
                  <button className="btn btn-primary btn-block" disabled={busy !== null || currentPlan === p.plan} onClick={() => go(p.plan)}>
                    {currentPlan === p.plan ? "Current plan" : busy === p.plan ? "Redirecting to checkout" : `Choose ${p.name}`}
                  </button>
                </div>
              </section>
            ))}
            <section className="card plan" aria-label="Enterprise plan">
              <div className="card-b" style={{ flex: 1 }}>
                <div className="eyebrow">Enterprise</div>
                <p className="price" style={{ fontSize: 20, marginTop: 14 }}>By inquiry</p>
                <ul>
                  <li>Multiple seats and teams</li>
                  <li>Terms arranged with EXJET</li>
                </ul>
              </div>
              <div className="card-f">
                <button className="btn btn-block" onClick={() => setInq((v) => !v)} aria-expanded={inq}>Make an inquiry</button>
              </div>
            </section>
          </div>
        )}
      </Async>
      <ActionError error={checkout.error} />
      {inq ? <EnterpriseInquiryForm /> : null}
    </div>
  );
}

export function EnterpriseInquiryForm() {
  const [company, setCompany] = useState("");
  const [seats, setSeats] = useState("5");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const inquiry = useAction(api.enterpriseInquiry);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await inquiry.run({ company, seats: Number(seats) || 1, notes });
    if (r !== undefined) setSent(true);
  }
  if (sent) return <Banner tone="ok" live>Inquiry received. EXJET will contact you by email.</Banner>;
  return (
    <form className="card card-b" onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <h2>Enterprise inquiry</h2>
      <Field label="Company" id="inq-company"><input id="inq-company" className="input" required value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
      <Field label="Seats" id="inq-seats"><input id="inq-seats" className="input" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} inputMode="numeric" /></Field>
      <Field label="Notes" id="inq-notes"><textarea id="inq-notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <ActionError error={inquiry.error} />
      <div><button className="btn btn-primary" disabled={inquiry.pending || !company}>{inquiry.pending ? "Sending" : "Send inquiry"}</button></div>
    </form>
  );
}
