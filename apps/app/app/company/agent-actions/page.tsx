"use client";

import { api, type AgentAction } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader, StatusChip, type Column } from "@/components/ui";

export default function AgentActionsPage() {
  const q = useApi<AgentAction[]>("agent-actions", api.agentActions, { refreshMs: 15_000 });
  const cols: Column<AgentAction>[] = [
    { key: "a", label: "Agent", render: (a) => a.agent },
    { key: "x", label: "Event", render: (a) => <span className="mono">{a.event}</span> },
    { key: "s", label: "Status", render: (a) => <StatusChip status={a.status} /> },
    { key: "p", label: "Permission", render: (a) => a.permission_level },
    { key: "m", label: "Error", render: (a) => a.error ?? <span className="muted">—</span> },
    { key: "t", label: "When", render: (a) => formatWhen(a.created_at) },
  ];
  return (
    <>
      <PageHeader title="Agent actions">Everything automated agents have done or been blocked from doing.</PageHeader>
      <Card flush><Async q={q}>{(l) => l.length === 0 ? <EmptyState title="No agent actions" /> : <DataTable caption="Agent actions" columns={cols} rows={l} rowKey={(a) => a.id} />}</Async></Card>
    </>
  );
}
