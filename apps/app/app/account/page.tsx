"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type KycStatusResponse } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { formatDate } from "@/lib/rules";
import { ActionError, Async, Banner, Card, Chip, Field, PageHeader, StatusChip } from "@/components/ui";
import { Plans } from "@/components/Plans";

const PLAN_NAME: Record<string, string> = { individual: "Individual", family_office: "Family Office", enterprise: "Enterprise" };

export default function AccountPage() {
  const { me, setMe } = useMe();
  const router = useRouter();
  const kyc = useApi<KycStatusResponse>(me ? "kyc-account" : null, api.kycStatus);
  const portal = useAction(api.portal);
  const logout = useAction(api.logout);
  const invite = useAction(api.inviteSeat);
  const [seatEmail, setSeatEmail] = useState("");
  const [invited, setInvited] = useState<string | null>(null);
  if (!me) return null;
  const sub = me.subscription;

  async function openPortal() {
    const r = await portal.run();
    if (r) window.location.assign(r.url);
  }
  async function signOut() {
    await logout.run();
    setMe(null);
    router.replace("/login");
  }
  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    const r = await invite.run(seatEmail);
    if (r !== undefined) {
      setInvited(seatEmail);
      setSeatEmail("");
    }
  }

  return (
    <>
      <PageHeader title="Account" actions={<button className="btn" onClick={signOut} disabled={logout.pending}>Sign out</button>}>Profile, verification and membership.</PageHeader>
      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="stack">
          <Card title="Profile">
            <dl className="kv">
              <dt>Name</dt><dd>{me.user.full_name}</dd>
              <dt>Email</dt><dd>{me.user.email}</dd>
              <dt>Account type</dt><dd>{PLAN_NAME[me.account.type] ?? me.account.type}</dd>
              <dt>Seats</dt><dd>{me.account.seats}</dd>
            </dl>
          </Card>
          {me.account.type === "family_office" ? (
            <Card title="Seats">
              <p className="muted" style={{ marginBottom: 12 }}>Family Office includes a second seat. Invite the second member by email.</p>
              <form onSubmit={sendInvite} className="row">
                <Field label="Second seat email" id="seat"><input id="seat" className="input" type="email" required value={seatEmail} onChange={(e) => setSeatEmail(e.target.value)} /></Field>
                <button className="btn btn-primary" disabled={invite.pending || !seatEmail}>{invite.pending ? "Sending" : "Send invite"}</button>
              </form>
              <div style={{ marginTop: 8 }}><ActionError error={invite.error} />{invited ? <Banner tone="ok" live>Invite sent to {invited}.</Banner> : null}</div>
            </Card>
          ) : null}
          <Card title="Identity verification" actions={<Chip tone={me.account.kyc_status === "approved" ? "ok" : me.account.kyc_status === "rejected" ? "problem" : "wait"}>{me.account.kyc_status === "approved" ? "Approved" : me.account.kyc_status === "pending" ? "In review" : me.account.kyc_status === "rejected" ? "Declined" : "Not started"}</Chip>}>
            <Async q={kyc} skeleton={<div className="skeleton" style={{ height: 40 }} />}>
              {(k) => (
                <div style={{ display: "grid", gap: 8 }}>
                  {k.latest_submission ? (
                    <dl className="kv">
                      <dt>Last submission</dt><dd>{formatDate(k.latest_submission.created_at)}</dd>
                      <dt>Status</dt><dd>{k.latest_submission.status}</dd>
                      {k.latest_submission.decision_note ? (<><dt>Note</dt><dd>{k.latest_submission.decision_note}</dd></>) : null}
                    </dl>
                  ) : <p className="muted">No documents submitted.</p>}
                  {me.account.kyc_status !== "approved" ? <div><Link className="btn" href="/onboarding">{me.account.kyc_status === "pending" ? "View status" : "Continue verification"}</Link></div> : null}
                </div>
              )}
            </Async>
          </Card>
        </div>
        <div className="stack">
          <Card title="Membership" actions={sub ? <StatusChip status={sub.status} /> : <Chip tone="neutral">None</Chip>}>
            {sub ? (
              <div style={{ display: "grid", gap: 12 }}>
                <dl className="kv">
                  <dt>Plan</dt><dd>{PLAN_NAME[sub.plan] ?? sub.plan}</dd>
                  <dt>Status</dt><dd>{sub.status}</dd>
                  <dt>Renews</dt><dd>{formatDate(sub.current_period_end)}</dd>
                </dl>
                <ActionError error={portal.error} />
                <div><button className="btn" onClick={openPortal} disabled={portal.pending}>{portal.pending ? "Opening" : "Manage billing"}</button></div>
              </div>
            ) : (
              <p className="muted">No active membership. Membership is required to send RFQs and see operator details.</p>
            )}
          </Card>
        </div>
      </div>
      {!sub ? (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ marginBottom: 12 }}>Membership plans</h2>
          <Plans />
        </div>
      ) : null}
    </>
  );
}
