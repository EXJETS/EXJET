"use client";

import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { api, apiUrl, type Trip } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { acceptedQuote, formatWhen } from "@/lib/rules";
import { ActionError, Banner, Card, Chip, Money } from "../ui";

export function ContractSection({ trip, locked, onChange }: { trip: Trip; locked: boolean; onChange: () => void }) {
  const q = acceptedQuote(trip);
  const [read, setRead] = useState(false);
  const ack = useAction(api.acknowledgeContract);
  if (locked || !q) {
    return (
      <Card id="contract" num="05" title="Contract">
        <p className="muted">Available after you accept a quote.</p>
      </Card>
    );
  }
  const c = q.contract;
  async function go() {
    if (!c) return;
    const r = await ack.run(c.id);
    if (r !== undefined) onChange();
  }
  return (
    <Card id="contract" num="05" title="Contract">
      <div style={{ display: "grid", gap: 12 }}>
        <dl className="kv">
          <dt>Operator</dt><dd>{q.operator?.dba_name}</dd>
          <dt>Accepted total</dt><dd><strong><Money cents={q.total_amount_cents} currency={q.currency} /></strong> <span className="muted small">as stated by the operator</span></dd>
        </dl>
        {c ? (
          <>
            <div><a className="btn" href={apiUrl(c.pdf_url) ?? "#"} target="_blank" rel="noopener noreferrer"><FileText size={16} aria-hidden /> View contract PDF</a></div>
            {c.acknowledged_at ? (
              <Chip tone="ok">Acknowledged {formatWhen(c.acknowledged_at)}</Chip>
            ) : (
              <>
                <label className="check" htmlFor="ack"><input id="ack" type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)} /><span>I have read the operator&apos;s contract. The flight is operated by the operator named in it.</span></label>
                <ActionError error={ack.error} />
                <div><button className="btn btn-primary" disabled={!read || ack.pending} onClick={go}>{ack.pending ? "Saving" : "Acknowledge contract"}</button></div>
              </>
            )}
          </>
        ) : <Banner tone="wait">No contract document is attached to this quote.</Banner>}
      </div>
    </Card>
  );
}

export function PaymentSection({ trip, locked, onChange }: { trip: Trip; locked: boolean; onChange: () => void }) {
  const q = acceptedQuote(trip);
  const [confirm, setConfirm] = useState(false);
  const paid = useAction(api.markPaid);
  const link = q?.payment_link;
  const ackd = !!q?.contract?.acknowledged_at;
  const done = ["paid", "manifest_due", "scheduled", "in_flight", "completed"].includes(trip.status);
  if (locked || !q) {
    return (
      <Card id="payment" num="06" title="Payment">
        <p className="muted">Available after you acknowledge the contract.</p>
      </Card>
    );
  }
  async function go() {
    const r = await paid.run(q!.id);
    if (r) onChange();
    setConfirm(false);
  }
  return (
    <Card id="payment" num="06" title="Payment">
      <div style={{ display: "grid", gap: 12 }}>
        <Banner>Payment is made directly to the operator. EXJET does not process flight payments and cannot see the status of your payment.</Banner>
        {link ? (
          <dl className="kv">
            <dt>Pay to</dt><dd>{q.operator?.dba_name}</dd>
            <dt>Payment site</dt><dd className="mono">{link.host}</dd>
            <dt>Amount</dt><dd><Money cents={q.total_amount_cents} currency={q.currency} /> <span className="muted small">per the operator&apos;s quote</span></dd>
          </dl>
        ) : <Banner tone="wait">The operator has not provided a payment link yet.</Banner>}
        {done ? (
          <Chip tone="ok">Marked as paid</Chip>
        ) : (
          <>
            <div className="actions">
              {link && ackd ? (
                <a className="btn btn-primary" href={link.url} target="_blank" rel="noopener noreferrer">Pay operator <ExternalLink size={14} aria-hidden /><span className="sr-only"> (opens {link.host} in a new tab)</span></a>
              ) : <button className="btn btn-primary" disabled>Pay operator</button>}
              {!confirm ? (
                <button className="btn" disabled={!link || !ackd} onClick={() => setConfirm(true)}>I have paid</button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={go} disabled={paid.pending}>{paid.pending ? "Saving" : "Confirm: I have paid the operator"}</button>
                  <button className="btn" onClick={() => setConfirm(false)}>Cancel</button>
                </>
              )}
            </div>
            {!ackd ? <p className="muted small">Acknowledge the contract first.</p> : null}
            <ActionError error={paid.error} />
          </>
        )}
      </div>
    </Card>
  );
}
