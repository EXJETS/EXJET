"use client";

import { api, type Metrics } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatMoney } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader } from "@/components/ui";

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card stat">
      <div className="eyebrow">{label}</div>
      <div className={`v ${value === "—" ? "null" : ""}`}>{value}</div>
      {note ? <div className="muted small">{note}</div> : null}
    </div>
  );
}

export default function Overview() {
  const q = useApi<Metrics>("metrics", api.metrics, { refreshMs: 30_000 });
  return (
    <>
      <PageHeader title="Overview">Live figures from the platform. A dash means the value is not available; nothing is estimated.</PageHeader>
      <Async q={q} skeleton={<div className="grid4">{[0, 1, 2, 3].map((i) => <div key={i} className="card stat"><div className="skeleton" style={{ height: 52 }} /></div>)}</div>}>
        {(m) => {
          const plans = Object.entries(m.members_by_plan ?? {});
          return (
            <div style={{ display: "grid", gap: 16 }}>
              <div className="grid4">
                <Stat label="MRR" value={m.mrr_cents === null ? "—" : formatMoney(m.mrr_cents)} />
                <Stat label="ARR" value={m.arr_cents === null ? "—" : formatMoney(m.arr_cents)} />
                <Stat label="KYC queue" value={m.kyc_queue === null ? "—" : String(m.kyc_queue)} note="Submissions awaiting decision" />
                <Stat label="RFQ to quote rate" value={m.rfq_to_quote_rate === null ? "—" : `${(m.rfq_to_quote_rate * 100).toFixed(0)}%`} />
              </div>
              <div className="grid4">
                <Stat label="Median operator response" value={m.median_operator_response_minutes === null ? "—" : `${m.median_operator_response_minutes} min`} />
              </div>
              <Card title="Members by plan" flush>
                {plans.length === 0 ? <EmptyState title="No member data" /> : (
                  <DataTable caption="Members by plan" columns={[{ key: "p", label: "Plan", render: (r) => r[0].replace(/_/g, " ") }, { key: "n", label: "Members", num: true, render: (r) => r[1] }]} rows={plans} rowKey={(r) => r[0]} />
                )}
              </Card>
            </div>
          );
        }}
      </Async>
    </>
  );
}
