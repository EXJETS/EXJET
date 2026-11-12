"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { api, apiUrl, type Approval, type KycSubmissionDetail } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Banner, Card, DataTable, PageHeader, StatusChip } from "@/components/ui";
import { ApprovalDecision } from "@/components/ApprovalDecision";

export default function KycDetail() {
  const { id } = useParams<{ id: string }>();
  const q = useApi<KycSubmissionDetail>(`kyc-detail:${id}`, () => api.kycSubmission(id), { refreshMs: 8000, poll: (k) => k.status === "submitted" });
  // The decision is an approval of kind kyc_final whose subject is this submission.
  const approvals = useApi<Approval[]>(`approvals:kyc_final`, () => api.approvals(undefined, "kyc_final"), { refreshMs: 8000, poll: () => true });
  const approval = approvals.data?.find((a) => a.subject_id === id);
  const refreshAll = () => { q.reload(); approvals.reload(); };
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
                    <dt>Type</dt><dd>{k.kind}</dd>
                    <dt>Vendor</dt><dd>{k.vendor ?? "—"}</dd>
                    <dt>Decision note</dt><dd>{k.decision_note ?? "—"}</dd>
                  </dl>
                </Card>
                <Card title="Documents" flush>
                  <DataTable caption="Documents" columns={[
                    { key: "t", label: "Type", render: (d) => (d.doc_type ?? "document").replace(/_/g, " ") },
                    { key: "f", label: "File", render: (d) => d.filename },
                    { key: "l", label: "", hideLabel: true, render: (d) => <a href={apiUrl(d.url) ?? "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><FileText size={14} aria-hidden /> Open (access is logged)</a> },
                  ]} rows={k.documents} rowKey={(d) => d.id} />
                </Card>
              </div>
              <div className="stack">
                <Card title="Vendor result">
                  {k.vendor_result ? (
                    <dl className="kv">{Object.entries(k.vendor_result).map(([key, v]) => (<span key={key} style={{ display: "contents" }}><dt>{key.replace(/_/g, " ")}</dt><dd>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd></span>))}</dl>
                  ) : <p className="muted">No vendor result yet. The check runs as a background job.</p>}
                </Card>
                <Card title="Decision">
                  <p className="muted small" style={{ marginBottom: 12 }}>Vendor results inform the decision; they never approve an account by themselves.</p>
                  {approval ? <ApprovalDecision approval={approval} onDone={refreshAll} /> : <Banner tone="wait">No approval record exists for this submission yet. It is created when the vendor check finishes.</Banner>}
                </Card>
              </div>
            </div>
          </>
        )}
      </Async>
    </>
  );
}
