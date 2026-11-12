"use client";

import Link from "next/link";
import { useState } from "react";
import { api, type KycSubmissionRow } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader, StatusChip, type Column } from "@/components/ui";

export default function KycQueue() {
  const [status, setStatus] = useState("pending");
  const q = useApi<KycSubmissionRow[]>(`kyc:${status}`, () => api.kycSubmissions(status || undefined));
  const cols: Column<KycSubmissionRow>[] = [
    { key: "h", label: "Holder", render: (k) => <Link className="rowlink" href={`/company/kyc/${k.id}`}>{k.holder_name}</Link> },
    { key: "k", label: "Type", render: (k) => (k.kind === "business" ? `Business: ${k.business_name ?? ""}` : "Individual") },
    { key: "s", label: "Status", render: (k) => <StatusChip status={k.status} /> },
    { key: "c", label: "Submitted", render: (k) => formatWhen(k.created_at) },
    { key: "o", label: "", hideLabel: true, render: (k) => <Link className="btn btn-sm" href={`/company/kyc/${k.id}`}>Review</Link> },
  ];
  return (
    <>
      <PageHeader title="KYC queue">Identity submissions. Only an admin decision sets an account to approved.</PageHeader>
      <div className="seg" role="group" aria-label="Filter" style={{ marginBottom: 16 }}>
        {([["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["", "All"]] as const).map(([v, l]) => <button key={l} aria-pressed={status === v} onClick={() => setStatus(v)}>{l}</button>)}
      </div>
      <Card flush>
        <Async q={q}>{(list) => list.length === 0 ? <EmptyState title="No submissions" /> : <DataTable caption="KYC submissions" columns={cols} rows={list} rowKey={(k) => k.id} />}</Async>
      </Card>
    </>
  );
}
