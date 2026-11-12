"use client";

import { api, type EnterpriseInquiryRecord } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader, type Column } from "@/components/ui";

export default function InquiriesPage() {
  const q = useApi<EnterpriseInquiryRecord[]>("inquiries", api.enterpriseInquiries);
  const cols: Column<EnterpriseInquiryRecord>[] = [
    { key: "c", label: "Company", render: (i) => <span style={{ fontWeight: 500 }}>{i.company}</span> },
    { key: "n", label: "Contact", render: (i) => <span>{i.contact_name ?? "—"}<br /><span className="muted small">{i.contact_email ?? ""}{i.contact_phone ? ` · ${i.contact_phone}` : ""}</span></span> },
    { key: "s", label: "Seats", num: true, render: (i) => i.seats },
    { key: "o", label: "Notes", render: (i) => i.notes ?? <span className="muted">—</span> },
    { key: "t", label: "Received", render: (i) => formatWhen(i.created_at) },
  ];
  return (
    <>
      <PageHeader title="Enterprise inquiries">Contact details are stored encrypted. Reading this list is audited.</PageHeader>
      <Card flush><Async q={q}>{(l) => l.length === 0 ? <EmptyState title="No inquiries yet" /> : <DataTable caption="Enterprise inquiries" columns={cols} rows={l} rowKey={(i) => i.id} />}</Async></Card>
    </>
  );
}
