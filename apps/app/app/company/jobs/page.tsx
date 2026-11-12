"use client";

import { api, type Job } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader, StatusChip, type Column } from "@/components/ui";

export default function JobsPage() {
  const q = useApi<Job[]>("jobs", api.jobs, { refreshMs: 15_000 });
  const cols: Column<Job>[] = [
    { key: "k", label: "Kind", render: (j) => <span className="mono">{j.kind}</span> },
    { key: "s", label: "Status", render: (j) => <StatusChip status={j.status} /> },
    { key: "a", label: "Attempts", num: true, render: (j) => `${j.attempts} / ${j.max_attempts}` },
    { key: "r", label: "Run at", render: (j) => formatWhen(j.run_at) },
    { key: "e", label: "Last error", render: (j) => j.last_error ?? <span className="muted">—</span> },
  ];
  return (
    <>
      <PageHeader title="Jobs">Background queue: RFQ dispatch, inbox polling, KYC checks, flight watch.</PageHeader>
      <Card flush><Async q={q}>{(l) => l.length === 0 ? <EmptyState title="No jobs" /> : <DataTable caption="Jobs" columns={cols} rows={l} rowKey={(j) => j.id} />}</Async></Card>
    </>
  );
}
