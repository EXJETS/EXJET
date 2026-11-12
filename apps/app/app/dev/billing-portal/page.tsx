"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Banner, Card, PageHeader } from "@/components/ui";

/** Test-only stand-in for the billing provider's customer portal. */
const ENABLED = process.env.NEXT_PUBLIC_DEV_BILLING === "1" || process.env.NEXT_PUBLIC_API_MOCK === "1";

export default function DevBillingPortal() {
  if (!ENABLED) notFound();
  return (
    <>
      <PageHeader title="Test billing portal" />
      <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
        <Banner tone="wait">Development only. The real portal is hosted by the billing provider.</Banner>
        <Card title="Manage billing"><p className="muted" style={{ marginBottom: 12 }}>Payment methods, invoices and cancellation live here in production.</p><Link className="btn" href="/account">Back to account</Link></Card>
      </div>
    </>
  );
}
