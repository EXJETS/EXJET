"use client";

import { api, type AdminOperator } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { ActionError, Async, Banner, Card, DataTable, EmptyState, PageHeader, Rating, StatusChip, type Column } from "@/components/ui";

const LABEL: Record<string, string> = { live: "Live", draft: "Draft", pending_ceo: "Awaiting CEO approval", suspended: "Suspended" };

export default function OperatorsPage() {
  const q = useApi<AdminOperator[]>("operators", api.adminOperators);
  const go = useAction(api.requestGoLive);
  const cols: Column<AdminOperator>[] = [
    { key: "n", label: "Operator", render: (o) => <span style={{ fontWeight: 500 }}>{o.dba_name}</span> },
    { key: "c", label: "Certificate", render: (o) => o.certificate_type ?? "—" },
    { key: "t", label: "Aircraft", num: true, render: (o) => o.aircraft_count },
    { key: "ct", label: "Contacts", num: true, render: (o) => o.contact_count },
    { key: "sr", label: "Safety", render: (o) => <Rating value={o.safety_rating} /> },
    { key: "s", label: "Go-live", render: (o) => <StatusChip status={o.go_live_status} label={LABEL[o.go_live_status]} /> },
    {
      key: "a", label: "", hideLabel: true,
      render: (o) => o.go_live_status === "draft" || o.go_live_status === "suspended"
        ? <button className="btn btn-sm" disabled={go.pending} onClick={async () => { if (await go.run(o.id)) q.reload(); }}>Request go-live</button>
        : <span className="muted small">{o.go_live_status === "live" ? "Receives RFQs" : "Decide under Approvals"}</span>,
    },
  ];
  return (
    <>
      <PageHeader title="Operators">Only live operators receive RFQs or appear in listings. Go-live requires an approval record.</PageHeader>
      <div style={{ display: "grid", gap: 16 }}>
        <ActionError error={go.error} />
        {go.pending ? <Banner>Requesting go-live</Banner> : null}
        {go.error ? null : null}
        <Card flush>
          <Async q={q}>{(list) => list.length === 0 ? <EmptyState title="No operators loaded">Upload an operator dataset under Data upload.</EmptyState> : <DataTable caption="Operators" columns={cols} rows={list} rowKey={(o) => o.id} />}</Async>
        </Card>
      </div>
    </>
  );
}
