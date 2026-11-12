"use client";

import { useState } from "react";
import { api, type SeatsOut } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { ActionError, Async, Banner, Card, DataTable, Field, StatusChip } from "./ui";

export function SeatsCard({ isOwner, accountType }: { isOwner: boolean; accountType: string }) {
  const multi = accountType === "family_office" || accountType === "enterprise";
  const q = useApi<SeatsOut>(isOwner && multi ? "seats" : null, api.seats);
  const invite = useAction(api.inviteSeat);
  const revoke = useAction(api.revokeInvitation);
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState<string | null>(null);
  if (!multi) return null;
  if (!isOwner) {
    return <Card title="Seats"><p className="muted">You hold a seat on the account owner&apos;s membership. Seats are managed by the owner.</p></Card>;
  }
  return (
    <Card title="Seats" flush>
      <Async q={q} skeleton={<div className="card-b"><div className="skeleton" style={{ height: 60 }} /></div>}>
        {(s) => (
          <div>
            <p className="muted small" style={{ padding: "12px 16px 0" }}>{s.members.length + s.invitations.length} of {s.seats} seats in use or reserved.</p>
            <DataTable caption="Members" columns={[
              { key: "e", label: "Member", render: (m) => <span>{m.email}{m.is_owner ? <span className="muted small"> (owner)</span> : null}</span> },
              { key: "i", label: "Identity", render: (m) => <StatusChip status={m.identity_status} /> },
              { key: "s", label: "Status", render: (m) => (m.is_suspended ? <StatusChip status="suspended" /> : <StatusChip status="active" />) },
            ]} rows={s.members} rowKey={(m) => m.user_id} />
            {s.invitations.length ? (
              <DataTable caption="Pending invitations" columns={[
                { key: "e", label: "Invited", render: (i) => i.email },
                { key: "x", label: "Expires", render: (i) => formatWhen(i.expires_at) },
                { key: "r", label: "", hideLabel: true, render: (i) => <button className="btn btn-sm" disabled={revoke.pending} onClick={async () => { const r = await revoke.run(i.id); if (r !== undefined) q.reload(); }}>Revoke</button> },
              ]} rows={s.invitations} rowKey={(i) => i.id} />
            ) : null}
            <form style={{ padding: 16, display: "grid", gap: 8, borderTop: "1px solid var(--line)" }} onSubmit={async (e) => {
              e.preventDefault();
              const r = await invite.run(email);
              if (r) { setInvited(email); setEmail(""); q.reload(); }
            }}>
              <div className="row">
                <Field label="Invite by email" id="seat" help="The invitee signs in with this address, accepts, and completes their own identity check."><input id="seat" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <button className="btn btn-primary" disabled={invite.pending || !email}>{invite.pending ? "Sending" : "Send invitation"}</button>
              </div>
              <ActionError error={invite.error ?? revoke.error} />
              {invited ? <Banner tone="ok" live>Invitation queued for {invited}.</Banner> : null}
            </form>
          </div>
        )}
      </Async>
    </Card>
  );
}
