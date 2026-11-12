"use client";

import { Suspense, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { ActionError, Banner, Card, PageHeader } from "@/components/ui";

/** Test-only stand-in for the billing provider's hosted checkout. Exists only when NEXT_PUBLIC_DEV_BILLING=1 or in mock mode. */
const ENABLED = process.env.NEXT_PUBLIC_DEV_BILLING === "1" || process.env.NEXT_PUBLIC_API_MOCK === "1";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const { me, refresh } = useMe();
  const plan = params.get("plan") ?? "individual";
  const done = useAction(api.devCompleteCheckout);
  const [ok, setOk] = useState(false);
  return (
    <>
      <PageHeader title="Test checkout" />
      <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
        <Banner tone="wait">Development only. This stands in for the billing provider. No payment is taken.</Banner>
        <Card title={`Plan: ${plan.replace(/_/g, " ")}`} footer={
          <button className="btn btn-primary" disabled={!me?.account || done.pending || ok} onClick={async () => {
            const r = await done.run(me!.account!.id, plan);
            if (r !== undefined) { setOk(true); await refresh(); router.replace("/onboarding?checkout=success"); }
          }}>{done.pending ? "Completing" : "Complete test checkout"}</button>
        }>
          <p className="muted">Completing activates the membership for this account, as the provider&apos;s webhook would.</p>
          <ActionError error={done.error} />
        </Card>
      </div>
    </>
  );
}

export default function DevCheckout() {
  if (!ENABLED) notFound();
  return <Suspense><Inner /></Suspense>;
}
