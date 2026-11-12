"use client";

import { useState } from "react";
import { api, type Approval } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { ActionError, Async, Card, DataTable, EmptyState, Field, PageHeader, StatusChip, type Column } from "@/components/ui";

export function ApprovalDecision({ approval, onDone }: { approval: Approval; onDone: () => void }) {
  const [note, setNote] = useState("");
  const decide = useAction(api.decideApproval);
  async function go(d: "approved" | "rejected") {
    const r = await decide.run(approval.id, d, note.trim());
    if (r) {
      setNote("");
      onDone();
    }
  }
  if (approval.status !== "pending") {
    return (
      <dl className="kv">
        <dt>Decision</dt><dd><StatusChip status={approval.status} /></dd>
        <dt>Decided</dt><dd>{formatWhen(approval.decided_at)}</dd>
        <dt>Note</dt><dd>{approval.decision_note ?? "—"}</dd>
      </dl>
    );
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Field label="Decision note (required)" id={`note-${approval.id}`}><textarea id={`note-${approval.id}`} className="textarea" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <ActionError error={decide.error} />
      <div className="actions">
        <button className="btn btn-primary" disabled={!note.trim() || decide.pending} onClick={() => go("approved")}>Approve</button>
        <button className="btn btn-danger" disabled={!note.trim() || decide.pending} onClick={() => go("rejected")}>Reject</button>
      </div>
    </div>
  );
}

const FILTERS = [["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["", "All"]] as const;

export default function ApprovalsPage() {
  const [status, setStatus] = useState<string>("pending");
  const [sel, setSel] = useState<string | null>(null);
  const q = useApi<Approval[]>(`approvals:${status}`, () => api.approvals(status || undefined));
  const cols: Column<Approval>[] = [
    { key: "k", label: "Kind", render: (a) => <button className="link-btn" onClick={() => setSel(a.id)} aria-pressed={sel === a.id}>{a.kind.replace(/_/g, " ")}</button> },
    { key: "s", label: "Summary", render: (a) => a.summary ?? "—" },
    { key: "st", label: "Status", render: (a) => <StatusChip status={a.status} /> },
    { key: "at", label: "Requested", render: (a) => formatWhen(a.requested_at) },
  ];
  return (
    <>
      <PageHeader title="Approvals">Decisions that need a recorded approval before the platform acts.</PageHeader>
      <div className="seg" role="group" aria-label="Filter" style={{ marginBottom: 16 }}>
        {FILTERS.map(([v, l]) => <button key={l} aria-pressed={status === v} onClick={() => { setStatus(v); setSel(null); }}>{l}</button>)}
      </div>
      <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", alignItems: "start" }}>
        <Card flush>
          <Async q={q}>{(list) => list.length === 0 ? <EmptyState title="Nothing here" /> : <DataTable caption="Approvals" columns={cols} rows={list} rowKey={(a) => a.id} />}</Async>
        </Card>
        <Card title="Detail">
          {q.data?.find((a) => a.id === sel) ? (() => {
            const a = q.data!.find((x) => x.id === sel)!;
            return (
              <div style={{ display: "grid", gap: 16 }}>
                <dl className="kv">
                  <dt>Kind</dt><dd>{a.kind.replace(/_/g, " ")}</dd>
                  <dt>Summary</dt><dd>{a.summary ?? "—"}</dd>
                  <dt>Subject</dt><dd className="mono">{a.subject_type ?? "—"} {a.subject_id ?? ""}</dd>
                  <dt>Requested by</dt><dd>{a.requested_by ?? "—"}</dd>
                  <dt>Requested</dt><dd>{formatWhen(a.requested_at)}</dd>
                </dl>
                {a.payload ? <details className="report"><summary>Payload</summary><pre className="raw">{JSON.stringify(a.payload, null, 2)}</pre></details> : null}
                <ApprovalDecision approval={a} onDone={q.reload} />
              </div>
            );
          })() : <EmptyState title="Select an approval" />}
        </Card>
      </div>
    </>
  );
}
