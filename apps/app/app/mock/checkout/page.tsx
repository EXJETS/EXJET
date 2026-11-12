"use client";

import { Suspense } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { isMock } from "@/lib/api";
import { useMe } from "@/hooks/me";
import { PageHeader, Card, Banner } from "@/components/ui";

/** Stand-in for the billing provider's hosted checkout. Exists only in mock mode. */
function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const { me, setMe } = useMe();
  const plan = params.get("plan") ?? "individual";
  async function pay() {
    const { mockSetSubscription } = await import("@/lib/api/mock");
    const next = mockSetSubscription(plan);
    if (next) setMe(next);
    router.replace("/onboarding?checkout=success");
  }
  return (
    <>
      <PageHeader title="Mock checkout" />
      <Banner tone="wait">This stands in for the billing provider. No payment is taken. Synthetic data.</Banner>
      <div style={{ height: 16 }} />
      <Card title={`Plan: ${plan}`} footer={<button className="btn btn-primary" onClick={pay} disabled={!me}>Complete mock checkout</button>}>
        <p className="muted">Completing this activates the membership on the mock account.</p>
      </Card>
    </>
  );
}

export default function MockCheckout() {
  if (!isMock()) notFound();
  return <Suspense><Inner /></Suspense>;
}
