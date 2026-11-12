"use client";

import Link from "next/link";
import { api, type QuarantinedMessage } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, Chip, DataTable, EmptyState, PageHeader, type Column } from "@/components/ui";

export default function QuarantinedPage() {
  const q = useApi<QuarantinedMessage[]>("quarantined", api.quarantined, { refreshMs: 10_000 });
  const cols: Column<QuarantinedMessage>[] = [
    { key: "f", label: "From", render: (m) => <span className="mono">{m.from_address}</span> },
    { key: "s", label: "Subject", render: (m) => m.subject },
    { key: "r", label: "Reason", render: (m) => (m.reason ? <Chip tone="wait" plain>{m.reason.replace(/_/g, " ")}</Chip> : "—") },
    { key: "d", label: "DMARC", render: (m) => (m.dmarc_pass === null ? "—" : m.dmarc_pass ? <Chip tone="ok">pass</Chip> : <Chip tone="problem">fail</Chip>) },
    { key: "a", label: "SPF / DKIM", render: (m) => <span className="mono small">{m.spf ?? "—"} / {m.dkim ?? "—"}</span> },
    { key: "t", label: "Received", render: (m) => formatWhen(m.received_at) },
    { key: "p", label: "Approval", render: (m) => (m.approval_id ? <Link href="/company/approvals">Open approvals</Link> : <span className="muted">None</span>) },
  ];
  return (
    <>
      <PageHeader title="Quarantined mail">Inbound replies that did not pass sender, authentication or attachment checks. They never create a member-visible quote until an admin approves them.</PageHeader>
      <Card flush><Async q={q}>{(l) => l.length === 0 ? <EmptyState title="Nothing quarantined" /> : <DataTable caption="Quarantined inbound mail" columns={cols} rows={l} rowKey={(m) => m.id} />}</Async></Card>
    </>
  );
}
