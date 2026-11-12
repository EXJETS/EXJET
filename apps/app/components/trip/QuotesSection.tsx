"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { api, apiUrl, type Quote, type Trip } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { formatWhen } from "@/lib/rules";
import { ActionError, Banner, Card, DataTable, EmptyState, EntitlementGate, Money, StatusChip, type Column } from "../ui";

function QuoteActions({ q, trip, onChange }: { q: Quote; trip: Trip; onChange: () => void }) {
  const [confirm, setConfirm] = useState<"accept" | "decline" | null>(null);
  const accept = useAction(api.acceptQuote);
  const decline = useAction(api.declineQuote);
  const acceptedAny = trip.quotes.some((x) => x.status === "accepted");
  if (q.status !== "ready" || acceptedAny) return <StatusChip status={q.status} />;
  const err = accept.error ?? decline.error;
  if (confirm) {
    const run = async () => {
      const r = confirm === "accept" ? await accept.run(q.id) : await decline.run(q.id);
      if (r) onChange();
      else setConfirm(null);
    };
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <span className="small">{confirm === "accept" ? "Accepting declines the other quotes." : "Decline this quote?"}</span>
        <div className="actions">
          <button className={`btn btn-sm ${confirm === "accept" ? "btn-primary" : "btn-danger"}`} onClick={run} disabled={accept.pending || decline.pending}>Confirm {confirm}</button>
          <button className="btn btn-sm" onClick={() => setConfirm(null)}>Cancel</button>
        </div>
        <ActionError error={err} />
      </div>
    );
  }
  return (
    <div>
      <div className="actions">
        <button className="btn btn-sm btn-primary" onClick={() => setConfirm("accept")} disabled={!q.contract} title={q.contract ? undefined : "This quote has no contract document yet"}>Accept</button>
        <button className="btn btn-sm" onClick={() => setConfirm("decline")}>Decline</button>
      </div>
      <ActionError error={err} />
    </div>
  );
}

export function QuotesSection({ trip, onChange }: { trip: Trip; onChange: () => void }) {
  const { me } = useMe();
  const quotes = trip.quotes;
  const cols: Column<Quote>[] = [
    {
      key: "op", label: "Operator",
      render: (q) => (
        <div>
          <div style={{ fontWeight: 500 }}>{q.operator?.dba_name ?? "—"}</div>
          {q.operator_quote_number ? <div className="muted small mono">{q.operator_quote_number}</div> : null}
          {q.line_items.length ? (
            <details className="report"><summary className="small">Line items</summary>
              <ul className="ul-plain">{q.line_items.map((li, i) => <li key={i}><span className="small">{li.description}{li.page ? ` (p. ${li.page})` : ""}</span><Money cents={li.amount_cents} currency={q.currency} /></li>)}</ul>
            </details>
          ) : null}
        </div>
      ),
    },
    { key: "ac", label: "Aircraft", render: (q) => (q.listing ? `${q.listing.type.manufacturer} ${q.listing.type.model}` : "—") },
    { key: "tail", label: "Tail", render: (q) => (q.listing?.tail_number ? <span className="mono">{q.listing.tail_number}</span> : "—") },
    { key: "total", label: "Total (operator document)", num: true, render: (q) => <strong><Money cents={q.total_amount_cents} currency={q.currency} /></strong> },
    { key: "valid", label: "Valid until", render: (q) => formatWhen(q.valid_until) },
    {
      key: "docs", label: "Documents",
      render: (q) => (
        <span style={{ display: "inline-flex", gap: 12, flexWrap: "wrap" }}>
          {q.quote_pdf_url ? <a href={apiUrl(q.quote_pdf_url) ?? "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><FileText size={14} aria-hidden /> Quote PDF</a> : <span className="muted">No PDF</span>}
          {q.contract?.pdf_url ? <a href={apiUrl(q.contract.pdf_url) ?? "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><FileText size={14} aria-hidden /> Contract</a> : null}
        </span>
      ),
    },
    { key: "act", label: "Decision", hideLabel: false, render: (q) => <QuoteActions q={q} trip={trip} onChange={onChange} /> },
  ];

  return (
    <Card id="quotes" num="04" title="Quotes" flush footer={<span className="muted small" style={{ marginRight: "auto" }}>Amounts are stated by each operator in its own quote document. EXJET does not set, adjust or estimate prices.</span>}>
      {!me?.entitled ? (
        <div className="card-b"><EntitlementGate /></div>
      ) : quotes.length === 0 ? (
        <EmptyState title="No quotes yet">Operators reply by email. Quotes appear here as they arrive.</EmptyState>
      ) : (
        <div aria-live="polite">
          {quotes.some((q) => q.status === "needs_review") ? <div className="card-b"><Banner tone="wait">A quote with no readable total is held for review and shows no amount.</Banner></div> : null}
          <DataTable caption="Quote comparison" columns={cols} rows={quotes} rowKey={(q) => q.id} />
        </div>
      )}
    </Card>
  );
}
