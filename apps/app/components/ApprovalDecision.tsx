"use client";

import { useState } from "react";
import { api, type Approval } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { ActionError, Field, StatusChip } from "./ui";

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

