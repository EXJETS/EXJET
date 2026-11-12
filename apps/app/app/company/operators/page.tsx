"use client";

import { useState } from "react";
import { api, type AdminOperator } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { ActionError, Async, Banner, Card, Chip, DataTable, EmptyState, Field, PageHeader, Rating, StatusChip, type Column } from "@/components/ui";

const LABEL: Record<string, string> = { live: "Live", draft: "Draft", pending_ceo: "Awaiting CEO approval", suspended: "Suspended" };

function Hosts({ op, onSaved }: { op: AdminOperator; onSaved: () => void }) {
  const [text, setText] = useState(op.payment_hosts?.join("\n") ?? "");
  const save = useAction(api.setPaymentHosts);
  return (
    <form style={{ display: "grid", gap: 8 }} onSubmit={async (e) => {
      e.preventDefault();
      const hosts = text.split(/[\s,]+/).map((h) => h.trim().toLowerCase()).filter(Boolean);
      if (await save.run(op.id, hosts)) onSaved();
    }}>
      <Field label={`Approved payment hosts for ${op.dba_name}`} id={`hosts-${op.id}`} help="One host per line, for example pay.operator.com. A quote linking anywhere else is held for review.">
        <textarea id={`hosts-${op.id}`} className="textarea mono" style={{ minHeight: 64 }} value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <ActionError error={save.error} />
      <div><button className="btn btn-sm" disabled={save.pending}>{save.pending ? "Saving" : "Save hosts"}</button></div>
    </form>
  );
}

export default function OperatorsPage() {
  const q = useApi<AdminOperator[]>("operators", api.adminOperators);
  const go = useAction(api.requestGoLive);
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const cols: Column<AdminOperator>[] = [
    { key: "n", label: "Operator", render: (o) => <button className="link-btn" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>{o.dba_name}</button> },
    { key: "c", label: "Certificate", render: (o) => o.certificate_type },
    { key: "t", label: "Aircraft", num: true, render: (o) => o.aircraft_count },
    { key: "ct", label: "Contacts", num: true, render: (o) => o.contact_count },
    { key: "pc", label: "Awaiting confirmation", num: true, render: (o) => (o.pending_contact_count ? <Chip tone="wait">{o.pending_contact_count}</Chip> : 0) },
    { key: "ph", label: "Payment hosts", render: (o) => (o.payment_hosts?.length ? <span className="mono small">{o.payment_hosts.join(", ")}</span> : <span className="muted">None</span>) },
    { key: "sr", label: "Safety", render: (o) => <Rating value={o.safety_rating} /> },
    { key: "s", label: "Go-live", render: (o) => <StatusChip status={o.go_live_status} label={LABEL[o.go_live_status]} /> },
    {
      key: "a", label: "", hideLabel: true,
      render: (o) => o.go_live_status === "draft" || o.go_live_status === "suspended"
        ? <button className="btn btn-sm" disabled={go.pending} onClick={async () => { const r = await go.run(o.id); if (r) { setMsg(`Go-live approval requested for ${r.operator.dba_name}. Decide it under Approvals.`); q.reload(); } }}>Request go-live</button>
        : <span className="muted small">{o.go_live_status === "live" ? "Receives RFQs" : "Decide under Approvals"}</span>,
    },
  ];
  return (
    <>
      <PageHeader title="Operators">Only live operators receive RFQs or appear in listings. Go-live requires a human-decided approval.</PageHeader>
      <div style={{ display: "grid", gap: 16 }}>
        <ActionError error={go.error} />
        {msg ? <Banner tone="ok" live>{msg}</Banner> : null}
        <Card flush>
          <Async q={q}>{(list) => list.length === 0 ? <EmptyState title="No operators loaded">Upload an operator dataset under Data upload.</EmptyState> : <DataTable caption="Operators" columns={cols} rows={list} rowKey={(o) => o.id} />}</Async>
        </Card>
        {q.data?.find((o) => o.id === open) ? (
          <Card title="Operator settings">
            {(() => {
              const o = q.data!.find((x) => x.id === open)!;
              return (
                <div style={{ display: "grid", gap: 16 }}>
                  <Hosts key={o.id + (o.payment_hosts?.join() ?? "")} op={o} onSaved={q.reload} />
                  {o.pending_contact_count ? <Banner tone="wait">{o.pending_contact_count} contact{o.pending_contact_count === 1 ? "" : "s"} added by ingest do not receive RFQs until confirmed. The API confirms one contact at a time by contact id, but no endpoint lists the pending contacts yet, so they cannot be confirmed from here.</Banner> : null}
                </div>
              );
            })()}
          </Card>
        ) : null}
      </div>
    </>
  );
}
