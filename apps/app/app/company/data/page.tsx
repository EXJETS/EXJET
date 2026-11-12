"use client";

import { useState } from "react";
import { api, type IngestRun } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { ActionError, Async, Banner, Card, DataTable, EmptyState, Field, PageHeader, StatusChip, type Column } from "@/components/ui";

// ASSUMED dataset keys. The API validates the value; these are suggestions only.
const DATASETS = ["operators", "aircraft_types", "aircraft", "airports", "empty_legs"];

function Report({ run }: { run: IngestRun }) {
  const rej = run.report?.rejections ?? [];
  return (
    <details className="report">
      <summary>Report</summary>
      {rej.length ? (
        <ul className="ul-plain">{rej.map((r, i) => <li key={i}><span className="mono">row {String(r.row)}</span><span className="small">{r.reason}</span></li>)}</ul>
      ) : run.report ? <pre className="raw">{JSON.stringify(run.report, null, 2)}</pre> : <p className="muted small">No rejections recorded.</p>}
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
    { key: "s", label: "Status", render: (r) => <StatusChip status={r.status} /> },
    { key: "l", label: "Loaded", num: true, render: (r) => r.loaded_count ?? "—" },
    { key: "j", label: "Rejected", num: true, render: (r) => r.rejected_count ?? "—" },
    { key: "t", label: "Started", render: (r) => formatWhen(r.started_at) },
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
        {done ? <Banner tone="ok" live>Run {done.id} finished: {done.loaded_count ?? 0} loaded, {done.rejected_count ?? 0} rejected.</Banner> : null}
        <Card title="Runs" flush>
          <Async q={runs}>{(list) => list.length === 0 ? <EmptyState title="No ingest runs yet" /> : <DataTable caption="Ingest runs" columns={cols} rows={list} rowKey={(r) => r.id} />}</Async>
        </Card>
      </div>
    </>
  );
}
