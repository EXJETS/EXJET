"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api, type KycStatusResponse, type NextStep } from "@/lib/api";
import { useMe } from "@/hooks/me";
import { useApi } from "@/hooks/use-api";
import { Banner, Card, PageHeader, Spinner } from "@/components/ui";
import { KycForm } from "@/components/KycForm";
import { Plans } from "@/components/Plans";

const STEPS: { id: NextStep[]; label: string }[] = [
  { id: ["kyc"], label: "Verify identity" },
  { id: ["kyc_pending"], label: "Review" },
  { id: ["billing"], label: "Membership" },
  { id: ["ready"], label: "Ready" },
];

function Pending({ onApproved }: { onApproved: () => void }) {
  const st = useApi<KycStatusResponse>("kyc-status", api.kycStatus, { refreshMs: 4000 });
  const approved = st.data?.kyc_status === "approved" || st.data?.kyc_status === "rejected";
  useEffect(() => {
    if (approved) onApproved();
  }, [approved, onApproved]);
  return (
    <Card title="Verification in review">
      <div aria-live="polite" style={{ display: "grid", gap: 12 }}>
        <Banner tone="wait"><Spinner label="Your documents are being reviewed. This page updates automatically." /></Banner>
        {st.data?.latest_submission ? (
          <dl className="kv">
            <dt>Submission</dt><dd className="mono">{st.data.latest_submission.id}</dd>
            <dt>Status</dt><dd>{st.data.latest_submission.status}</dd>
          </dl>
        ) : null}
        <p className="muted">You can leave this page. Browsing aircraft stays available while we review.</p>
      </div>
    </Card>
  );
}

function Inner() {
  const { me, refresh } = useMe();
  const params = useSearchParams();
  const kyc = useApi<KycStatusResponse>(me?.next_step === "kyc" ? "kyc-rej" : null, api.kycStatus);
  useEffect(() => {
    if (params.get("checkout") === "success") void refresh();
  }, [params, refresh]);
  if (!me) return null;
  const step = me.next_step;
  const idx = STEPS.findIndex((s) => s.id.includes(step));
  const rejected = kyc.data?.kyc_status === "rejected" ? kyc.data.latest_submission?.decision_note ?? "See your email for details." : null;

  return (
    <>
      <PageHeader title="Get access">Verification and membership unlock RFQs and operator details. Browsing stays open.</PageHeader>
      <ol className="steps" aria-label="Onboarding progress">
        {STEPS.map((s, i) => (
          <li key={s.label} aria-current={i === idx ? "step" : undefined} data-done={i < idx}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>{s.label}{i < idx ? " (done)" : ""}
          </li>
        ))}
      </ol>
      {step === "kyc" ? <KycForm onDone={() => void refresh()} rejectedNote={rejected} /> : null}
      {step === "kyc_pending" ? <Pending onApproved={() => void refresh()} /> : null}
      {step === "billing" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <Banner tone="ok">Identity approved. Choose a membership to finish.</Banner>
          <Plans />
        </div>
      ) : null}
      {step === "ready" ? (
        <Card title="You are set">
          <p className="muted" style={{ marginBottom: 16 }}>Your account is verified and your membership is active.</p>
          <div className="actions">
            <Link className="btn btn-primary" href="/request">Request a trip</Link>
            <Link className="btn" href="/account">Account</Link>
          </div>
        </Card>
      ) : null}
    </>
  );
}

export default function OnboardingPage() {
  return <Suspense><Inner /></Suspense>;
}
