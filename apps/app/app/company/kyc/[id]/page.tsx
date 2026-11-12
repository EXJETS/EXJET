"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { api, apiUrl, type Approval, type KycSubmissionDetail } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Banner, Card, Chip, DataTable, PageHeader, StatusChip } from "@/components/ui";
import { ApprovalDecision } from "@/components/ApprovalDecision";

export default function KycDetail() {
  const { id } = useParams<{ id: string }>();
  const q = useApi<KycSubmissionDetail>(`kyc-detail:${id}`, () => api.kycSubmission(id));
  const approvals = useApi<Approval[]>(q.data?.approval_id ? "approvals:all-for-kyc" : null, () => api.approvals());
  const approval = approvals.data?.find((a) => a.id === q.data?.approval_id);
  return (
    <>
      <Link href="/company/kyc" className="muted small" style={{ display: "inline-flex", gap: 4, alignItems: "center", minHeight: 24 }}><ArrowLeft size={14} aria-hidden /> KYC queue</Link>
      <Async q={q}>
        {(k) => (
          <>
            <PageHeader title={k.holder_name} actions={<StatusChip status={k.status} />}>{k.kind === "business" ? "Business verification" : "Individual verification"} submitted {formatWhen(k.created_at)}</PageHeader>
            <div className="grid2" style={{ alignItems: "start" }}>
              <div className="stack">
                <Card title="Submission">
                  <dl className="kv">
                    <dt>Holder</dt><dd>{k.holder_name}</dd>
                    {k.kind === "business" ? (<><dt>Business</dt><dd>{k.business_name}</dd><dt>Tax ID</dt><dd className="mono">{k.business_tax_id ?? "—"}</dd></>) : null}
                    <dt>Decision note</dt><dd>{k.decision_note ?? "—"}</dd>
                  </dl>
                </Card>
                <Card title="Documents" flush>
                  <DataTable caption="Documents" columns={[
                    { key: "t", label: "Type", render: (d) => d.doc_type.replace(/_/g, " ") },
                    { key: "f", label: "File", render: (d) => d.filename ?? "—" },
                    { key: "l", label: "", hideLabel: true, render: (d) => <a href={apiUrl(d.url) ?? "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><FileText size={14} aria-hidden /> Open (access is logged)</a> },
                  ]} rows={k.documents} rowKey={(d) => d.id} />
                </Card>
              </div>
              <div className="stack">
                <Card title="Vendor signals" flush>
                  {k.signals.length ? <DataTable caption="Vendor signals" columns={[
                    { key: "n", label: "Check", render: (s) => s.name.replace(/_/g, " ") },
                    { key: "r", label: "Result", render: (s) => <Chip tone={s.result === "pass" ? "ok" : s.result === "fail" ? "problem" : "wait"}>{s.result}</Chip> },
                    { key: "d", label: "Detail", render: (s) => s.detail ?? "—" },
                  ]} rows={k.signals} rowKey={(s) => s.name} /> : <p className="card-b muted">No vendor signals recorded.</p>}
                </Card>
                <Card title="Decision">
                  <p className="muted small" style={{ marginBottom: 12 }}>Signals inform the decision; they never approve an account by themselves.</p>
                  {k.approval_id && approval ? <ApprovalDecision approval={approval} onDone={q.reload} /> : k.approval_id ? <Banner tone="wait">Loading approval record.</Banner> : <Banner tone="wait">No approval record is attached to this submission yet. A decision can only be made through an approval.</Banner>}
                </Card>
              </div>
            </div>
          </>
        )}
      </Async>
    </>
  );
}
