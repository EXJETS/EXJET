"use client";

import { useState } from "react";
import { api, type IngestRun } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { ActionError, Async, Banner, Card, DataTable, EmptyState, Field, PageHeader, type Column } from "@/components/ui";

// Dataset keys from the API ingest config (dependency order).
const DATASETS = ["airports_fbos", "operators", "aircraft", "outreach_lists"];

function Report({ run }: { run: IngestRun }) {
  return (
    <details className="report">
      <summary>Report</summary>
      {run.report ? <pre className="raw">{JSON.stringify(run.report, null, 2)}</pre> : <p className="muted small">No report recorded.</p>}
    </details>
  );
}

export default function DataPage() {
  const runs = useApi<IngestRun[]>("ingest-runs", api.ingestRuns);
  const ingest = useAction(api.ingest);
  const [dataset, setDataset] = useState("operators");
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState<IngestRun | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const f = new FormData();
    f.set("dataset", dataset);
    f.set("file", file);
    const r = await ingest.run(f);
    if (r) {
      setDone(r);
      setFile(null);
      (e.target as HTMLFormElement).reset();
      runs.reload();
    }
  }

  const cols: Column<IngestRun>[] = [
    { key: "d", label: "Dataset", render: (r) => <span className="mono">{r.dataset}</span> },
    { key: "f", label: "File", render: (r) => r.filename ?? "—" },
    { key: "rd", label: "Read", num: true, render: (r) => r.rows_read },
    { key: "l", label: "Loaded", num: true, render: (r) => r.rows_loaded },
    { key: "u", label: "Updated", num: true, render: (r) => r.rows_updated },
    { key: "j", label: "Rejected", num: true, render: (r) => r.rows_rejected },
    { key: "t", label: "When", render: (r) => formatWhen(r.created_at) },
    { key: "r", label: "Report", render: (r) => <Report run={r} /> },
  ];
  return (
    <>
      <PageHeader title="Data upload">Upload a dataset file. Rows for excluded operators are rejected at ingest.</PageHeader>
      <div style={{ display: "grid", gap: 16 }}>
        <form className="card" onSubmit={go}>
          <div className="card-h"><h2>New upload</h2></div>
          <div className="card-b row">
            <Field label="Dataset" id="dataset">
              <input id="dataset" className="input mono" list="datasets" value={dataset} onChange={(e) => setDataset(e.target.value)} required />
              <datalist id="datasets">{DATASETS.map((d) => <option key={d} value={d} />)}</datalist>
            </Field>
            <Field label="File (CSV)" id="file"><input id="file" className="input" type="file" accept=".csv,text/csv,.xlsx,.json" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required /></Field>
          </div>
          <div className="card-f">
            <button className="btn btn-primary" disabled={!file || !dataset || ingest.pending}>{ingest.pending ? "Uploading" : "Upload and ingest"}</button>
          </div>
        </form>
        <ActionError error={ingest.error} />
        {done ? <Banner tone="ok" live>Run {done.id} finished: {done.rows_loaded} loaded, {done.rows_rejected} rejected.</Banner> : null}
        <Card title="Runs" flush>
          <Async q={runs}>{(list) => list.length === 0 ? <EmptyState title="No ingest runs yet" /> : <DataTable caption="Ingest runs" columns={cols} rows={list} rowKey={(r) => r.id} />}</Async>
        </Card>
      </div>
    </>
  );
}
