"use client";

import { useState } from "react";
import { api, type Suppression, type SuppressionBody } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { ActionError, Async, Card, DataTable, EmptyState, Field, PageHeader, type Column } from "@/components/ui";

const REASONS: SuppressionBody["reason"][] = ["manual", "unsubscribe", "bounce", "complaint", "legal"];

export default function SuppressionsPage() {
  const q = useApi<Suppression[]>("suppressions", api.suppressions);
  const add = useAction(api.addSuppression);
  const del = useAction(api.deleteSuppression);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<SuppressionBody["reason"]>("manual");
  const [confirm, setConfirm] = useState<string | null>(null);
  const cols: Column<Suppression>[] = [
    { key: "e", label: "Address", render: (s) => <span className="mono">{s.email}</span> },
    { key: "r", label: "Reason", render: (s) => s.reason },
    { key: "s", label: "Source", render: (s) => s.source ?? "—" },
    { key: "c", label: "Added", render: (s) => formatWhen(s.created_at) },
    {
      key: "x", label: "", hideLabel: true,
      render: (s) => confirm === s.id ? (
        <span className="actions"><button className="btn btn-sm btn-danger" onClick={async () => { const r = await del.run(s.id); setConfirm(null); if (r !== undefined) q.reload(); }}>Confirm remove</button><button className="btn btn-sm" onClick={() => setConfirm(null)}>Cancel</button></span>
      ) : <button className="btn btn-sm" onClick={() => setConfirm(s.id)}>Remove</button>,
    },
  ];
  return (
    <>
      <PageHeader title="Suppressions">Addresses that never receive mail from EXJET. Checked before every send.</PageHeader>
      <div style={{ display: "grid", gap: 16 }}>
        <form className="card" onSubmit={async (e) => { e.preventDefault(); if (await add.run({ email, reason })) { setEmail(""); q.reload(); } }}>
          <div className="card-h"><h2>Add an address</h2></div>
          <div className="card-b row">
            <Field label="Email" id="sup-email"><input id="sup-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Reason" id="sup-reason"><select id="sup-reason" className="select" value={reason} onChange={(e) => setReason(e.target.value as SuppressionBody["reason"])}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
          </div>
          <div className="card-f"><button className="btn btn-primary" disabled={add.pending || !email}>{add.pending ? "Adding" : "Add suppression"}</button></div>
        </form>
        <ActionError error={add.error ?? del.error} />
        <Card flush><Async q={q}>{(l) => l.length === 0 ? <EmptyState title="No suppressions" /> : <DataTable caption="Suppressed addresses" columns={cols} rows={l} rowKey={(s) => s.id} />}</Async></Card>
      </div>
    </>
  );
}
