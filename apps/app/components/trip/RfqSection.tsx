"use client";

import type { Trip, Rfq } from "@/lib/api";
import { formatWhen } from "@/lib/rules";
import { Card, DataTable, EmptyState, StatusChip, type Column } from "../ui";

export function RfqSection({ trip }: { trip: Trip }) {
  const rfqs = trip.rfqs.filter((r) => r.kind === "charter" || r.kind === "empty_leg");
  const cols: Column<Rfq>[] = [
    { key: "ref", label: "Reference", render: (r) => <span className="mono" style={{ fontWeight: 700 }}>{r.reference}</span> },
    { key: "op", label: "Operator", render: (r) => r.listing?.operator?.dba_name ?? <span className="muted">Members only</span> },
    { key: "tail", label: "Tail", render: (r) => (r.listing?.tail_number ? <span className="mono">{r.listing.tail_number}</span> : <span className="muted">—</span>) },
    { key: "ac", label: "Aircraft", render: (r) => (r.listing ? `${r.listing.type.manufacturer} ${r.listing.type.model}` : "—") },
    { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
    { key: "sent", label: "Sent", render: (r) => formatWhen(r.sent_at) },
    { key: "rep", label: "Replied", render: (r) => formatWhen(r.replied_at) },
  ];
  return (
    <Card id="rfq" num="03" title="RFQs" flush>
      {rfqs.length === 0 ? (
        <EmptyState title="No RFQs sent yet">Select aircraft above and send an RFQ. Operators reply by email and their quotes appear here.</EmptyState>
      ) : (
        <div aria-live="polite">
          <DataTable caption="Requests for quote" columns={cols} rows={rfqs} rowKey={(r) => r.id} />
        </div>
      )}
    </Card>
  );
}
