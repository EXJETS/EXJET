"use client";

import Link from "next/link";
import { useState } from "react";
import { Download } from "lucide-react";
import { api, apiUrl, type AdminQuote, type Approval } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { ApprovalDecision } from "@/components/ApprovalDecision";
import { ActionError, Async, Banner, Card, Chip, EmptyState, Field, PageHeader, StatusChip } from "@/components/ui";

function Resolver({ q, onDone }: { q: AdminQuote; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [valid, setValid] = useState("");
  const resolve = useAction(api.resolveQuote);
  // Whole-dollar or decimal text -> cents without floating point drift.
  const cents = (() => {
    const m = /^\s*\$?\s*([\d,]+)(?:\.(\d{1,2}))?\s*$/.exec(amount);
    return m ? Number(m[1].replace(/,/g, "")) * 100 + Number((m[2] ?? "").padEnd(2, "0") || 0) : null;
  })();
  async function go(reject: boolean) {
    const r = await resolve.run(q.id, { total_amount_cents: reject ? 0 : (cents ?? 0), reject, valid_until: valid ? new Date(valid).toISOString() : null });
    if (r) onDone();
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Banner tone="wait">The amount must appear verbatim in the operator&apos;s PDF. Read it from the document; do not estimate.</Banner>
      <div className="row">
        <Field label="Total stated in the operator document (USD)" id={`amt-${q.id}`} help="Example: 45,200.00"><input id={`amt-${q.id}`} className="input mono" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Valid until (optional)" id={`val-${q.id}`}><input id={`val-${q.id}`} className="input" type="datetime-local" value={valid} onChange={(e) => setValid(e.target.value)} /></Field>
      </div>
      <ActionError error={resolve.error} />
      <div className="actions">
        <button className="btn btn-primary" disabled={cents === null || resolve.pending} onClick={() => go(false)}>Confirm total</button>
        <button className="btn btn-danger" disabled={resolve.pending} onClick={() => go(true)}>Reject quote</button>
      </div>
    </div>
  );
}

function HostDecision({ q, onDone }: { q: AdminQuote; onDone: () => void }) {
  const approvals = useApi<Approval[]>(q.payment_host_approval_id ? "approvals:payment_host" : null, () => api.approvals(undefined, "payment_host"));
  const a = approvals.data?.find((x) => x.id === q.payment_host_approval_id);
  if (!q.payment_host_approval_id) return <Banner tone="wait">No payment_host approval is attached. Add the host to the operator under Operators.</Banner>;
  if (!a) return <Banner>Loading the payment host approval.</Banner>;
  return <ApprovalDecision approval={a} onDone={() => { approvals.reload(); onDone(); }} />;
}

export default function QuoteReviewPage() {
  const [status, setStatus] = useState("needs_review");
  const q = useApi<AdminQuote[]>(`admin-quotes:${status}`, () => api.adminQuotes(status || undefined), { refreshMs: 10_000 });
  return (
    <>
      <PageHeader title="Quote review">Quotes held for review: an unreadable total, or a payment site that is not approved for the operator. Members cannot see them until resolved.</PageHeader>
      <div className="seg" role="group" aria-label="Filter" style={{ marginBottom: 16 }}>
        {([["needs_review", "Needs review"], ["", "All"]] as const).map(([v, l]) => <button key={l} aria-pressed={status === v} onClick={() => setStatus(v)}>{l}</button>)}
      </div>
      <Async q={q}>
        {(list) => list.length === 0 ? <Card><EmptyState title="No quotes need review" /></Card> : (
          <div className="stack">
            {list.map((x) => (
              <Card key={x.id} title={<span>Quote <span className="mono">{x.id.slice(0, 8)}</span></span>} actions={<StatusChip status={x.status} />}>
                <div style={{ display: "grid", gap: 16 }}>
                  <dl className="kv">
                    <dt>Trip</dt><dd className="mono">{x.trip_id}</dd>
                    <dt>Flags</dt><dd>{x.flags.length ? x.flags.map((f) => <Chip key={f} tone="wait" plain>{f.replace(/_/g, " ")}</Chip>) : "—"}</dd>
                    <dt>Parse confidence</dt><dd>{x.parse_confidence === null ? "—" : x.parse_confidence}</dd>
                    <dt>Payment site</dt>
                    <dd>{x.payment_host ? <><span className="mono" style={{ fontWeight: 700 }}>{x.payment_host}</span> {x.payment_host_approved ? <Chip tone="ok">Approved</Chip> : <Chip tone="problem">Not approved</Chip>}</> : <span className="muted">None found</span>}</dd>
                    <dt>Operator PDF</dt><dd>{x.pdf_url ? <a href={apiUrl(x.pdf_url) ?? "#"} download style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Download size={14} aria-hidden /> Download quote PDF</a> : <span className="muted">No PDF link</span>}</dd>
                  </dl>
                  {x.payment_host && x.payment_host_approved === false ? <HostDecision q={x} onDone={q.reload} /> : null}
                  {x.status === "needs_review" && x.payment_host_approved !== false ? <Resolver q={x} onDone={q.reload} /> : null}
                  <p className="small muted">Approvals are also listed under <Link href="/company/approvals">Approvals</Link>.</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Async>
    </>
  );
}
