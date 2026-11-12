"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type KycStatusResponse } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { formatDate } from "@/lib/rules";
import { ActionError, Async, Card, Chip, PageHeader, StatusChip } from "@/components/ui";
import { Plans } from "@/components/Plans";
import { SeatsCard } from "@/components/SeatsCard";
import { PasswordCard } from "@/components/PasswordCard";

const PLAN_NAME: Record<string, string> = { individual: "Individual", family_office: "Family Office", enterprise: "Enterprise" };

export default function AccountPage() {
  const { me, setMe } = useMe();
  const router = useRouter();
  const kyc = useApi<KycStatusResponse>(me ? "kyc-account" : null, api.kycStatus);
  const portal = useAction(api.portal);
  const logout = useAction(api.logout);
  if (!me) return null;
  const sub = me.subscription;
  const isOwner = !me.member || me.member.is_owner;
  const idStatus = me.member?.identity_status ?? me.account?.kyc_status ?? "not_started";
  const account = me.account ?? { id: "", type: "individual", display_name: me.user.full_name ?? me.user.email, seats: 1, kyc_status: "not_started" };

  async function openPortal() {
    const r = await portal.run();
    if (r) window.location.assign(r.url);
  }
  async function signOut() {
    await logout.run();
    setMe(null);
    router.replace("/login");
  }
  return (
    <>
      <PageHeader title="Account" actions={<button className="btn" onClick={signOut} disabled={logout.pending}>Sign out</button>}>Profile, verification and membership.</PageHeader>
      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="stack">
          <Card title="Profile">
            <dl className="kv">
              <dt>Name</dt><dd>{me.user.full_name ?? "—"}</dd>
              <dt>Email</dt><dd>{me.user.email}</dd>
              <dt>Account type</dt><dd>{PLAN_NAME[account.type] ?? account.type}</dd>
              <dt>Seats</dt><dd>{account.seats}</dd>
            </dl>
          </Card>
          <SeatsCard isOwner={isOwner} accountType={account.type} />
          <PasswordCard />
          <Card title={isOwner ? "Identity verification" : "Your identity verification"} actions={<Chip tone={idStatus === "approved" ? "ok" : idStatus === "rejected" ? "problem" : "wait"}>{idStatus === "approved" ? "Approved" : (idStatus === "submitted" || idStatus === "in_review") ? "In review" : idStatus === "rejected" ? "Declined" : "Not started"}</Chip>}>
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
                  {idStatus !== "approved" ? <div><Link className="btn" href="/onboarding">{(idStatus === "submitted" || idStatus === "in_review") ? "View status" : "Continue verification"}</Link></div> : null}
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
                {isOwner ? <div><button className="btn" onClick={openPortal} disabled={portal.pending}>{portal.pending ? "Opening" : "Manage billing"}</button></div> : <p className="muted small">Billing is managed by the account owner.</p>}
              </div>
            ) : (
              <p className="muted">No active membership. Membership is required to send RFQs and see operator details.</p>
            )}
          </Card>
        </div>
      </div>
      {!sub && isOwner ? (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ marginBottom: 12 }}>Membership plans</h2>
          <Plans />
        </div>
      ) : null}
    </>
  );
}
