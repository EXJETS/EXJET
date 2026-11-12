"use client";

import Link from "next/link";
import { useState } from "react";
import { api, type KycSubmissionDetail } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader, StatusChip, type Column } from "@/components/ui";

const FILTERS = [["", "All"], ["submitted", "Submitted"], ["in_review", "In review"], ["approved", "Approved"], ["rejected", "Rejected"]] as const;

export default function KycQueue() {
  const [status, setStatus] = useState("");
  const q = useApi<KycSubmissionDetail[]>(`kyc:${status}`, () => api.kycSubmissions(status || undefined), { refreshMs: 10_000 });
  const cols: Column<KycSubmissionDetail>[] = [
    { key: "h", label: "Holder", render: (k) => <Link className="rowlink" href={`/company/kyc/${k.id}`}>{k.holder_name}</Link> },
    { key: "k", label: "Type", render: (k) => (k.kind === "business" ? "Business" : "Individual") },
    { key: "s", label: "Status", render: (k) => <StatusChip status={k.status} /> },
    { key: "c", label: "Submitted", render: (k) => formatWhen(k.created_at) },
    { key: "o", label: "", hideLabel: true, render: (k) => <Link className="btn btn-sm" href={`/company/kyc/${k.id}`}>Review</Link> },
  ];
  return (
    <>
      <PageHeader title="KYC queue">Identity submissions. Only an admin decision sets an account to approved.</PageHeader>
      <div className="seg" role="group" aria-label="Filter" style={{ marginBottom: 16 }}>
        {FILTERS.map(([v, l]) => <button key={l} aria-pressed={status === v} onClick={() => setStatus(v)}>{l}</button>)}
      </div>
      <Card flush>
        <Async q={q}>{(list) => list.length === 0 ? <EmptyState title="No submissions" /> : <DataTable caption="KYC submissions" columns={cols} rows={list} rowKey={(k) => k.id} />}</Async>
      </Card>
    </>
  );
}
