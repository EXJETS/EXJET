"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { api, apiUrl, type AdminQuote } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { ActionError, Async, Banner, Card, EmptyState, Field, PageHeader, StatusChip } from "@/components/ui";

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

export default function QuoteReviewPage() {
  const q = useApi<AdminQuote[]>("admin-quotes", () => api.adminQuotes("needs_review"), { refreshMs: 10_000 });
  return (
    <>
      <PageHeader title="Quote review">Quotes whose total could not be read from the operator document. Members cannot see them until a total is confirmed.</PageHeader>
      <Async q={q}>
        {(list) => list.length === 0 ? <Card><EmptyState title="No quotes need review" /></Card> : (
          <div className="stack">
            {list.map((x) => (
              <Card key={x.id} title={<span>Quote <span className="mono">{x.id.slice(0, 8)}</span></span>} actions={<StatusChip status={x.status} />}>
                <div style={{ display: "grid", gap: 16 }}>
                  <dl className="kv">
                    <dt>Trip</dt><dd className="mono">{x.trip_id}</dd>
                    <dt>Flags</dt><dd>{x.flags.length ? x.flags.join(", ") : "—"}</dd>
                    <dt>Parse confidence</dt><dd>{x.parse_confidence === null ? "—" : x.parse_confidence}</dd>
                    <dt>Operator PDF</dt><dd>{x.pdf_url ? <a href={apiUrl(x.pdf_url) ?? "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><FileText size={14} aria-hidden /> Open quote PDF</a> : <span className="muted">No PDF link</span>}</dd>
                  </dl>
                  <Resolver q={x} onDone={q.reload} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Async>
    </>
  );
}
