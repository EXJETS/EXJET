"use client";

import { useState } from "react";
import { api, type KycDocType } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { ActionError, Banner, Field } from "./ui";

interface Row { doc_type: KycDocType; file: File | null }

export function KycForm({ onDone, rejectedNote }: { onDone: () => void; rejectedNote?: string | null }) {
  const { me } = useMe();
  const individualOnly = !!me?.member && !me.member.is_owner;
  const [kind, setKind] = useState<"individual" | "business">("individual");
  const [holder, setHolder] = useState("");
  const [bizName, setBizName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [rows, setRows] = useState<Row[]>([{ doc_type: "passport", file: null }]);
  const submit = useAction(api.submitKyc);

  function switchKind(k: "individual" | "business") {
    setKind(k);
    setRows(k === "individual" ? [{ doc_type: "passport", file: null }] : [{ doc_type: "passport", file: null }, { doc_type: "business_doc", file: null }]);
  }
  const setRow = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const valid = holder.trim() && rows.every((r) => r.file) && (kind === "individual" || (bizName.trim() && taxId.trim()));

  async function go(e: React.FormEvent) {
    e.preventDefault();
    const f = new FormData();
    f.set("kind", kind);
    f.set("holder_name", holder.trim());
    if (kind === "business") {
      f.set("business_name", bizName.trim());
      f.set("business_tax_id", taxId.trim());
    }
    rows.forEach((r) => {
      f.append("files", r.file as File);
      f.append("doc_types", r.doc_type);
    });
    const res = await submit.run(f);
    if (res) onDone();
  }

  return (
    <form onSubmit={go} className="card" style={{ maxWidth: 720 }}>
      <div className="card-h"><h2>Verify your identity</h2></div>
      <div className="card-b" style={{ display: "grid", gap: 16 }}>
        {rejectedNote ? <Banner tone="problem" live>Your last submission was not approved: {rejectedNote}</Banner> : null}
        <p className="muted">Documents are encrypted, used only for verification, and visible only to EXJET compliance staff.</p>
        {individualOnly ? <p className="muted">Invited members complete an individual identity check.</p> : null}
        <div role="radiogroup" aria-label="Verification type" className="seg" style={{ width: "fit-content", display: individualOnly ? "none" : undefined }}>
          <button type="button" role="radio" aria-checked={kind === "individual"} onClick={() => switchKind("individual")}>Individual</button>
          <button type="button" role="radio" aria-checked={kind === "business"} onClick={() => switchKind("business")}>Business</button>
        </div>
        <Field label={kind === "business" ? "Account holder name" : "Full legal name"} id="holder"><input id="holder" className="input" value={holder} onChange={(e) => setHolder(e.target.value)} autoComplete="name" required /></Field>
        {kind === "business" ? (
          <div className="grid2">
            <Field label="Business name" id="biz"><input id="biz" className="input" value={bizName} onChange={(e) => setBizName(e.target.value)} required /></Field>
            <Field label="EIN or equivalent tax ID" id="tax"><input id="tax" className="input mono" value={taxId} onChange={(e) => setTaxId(e.target.value)} required autoComplete="off" /></Field>
          </div>
        ) : null}
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((r, i) => (
            <div key={i} className="drop" style={{ display: "grid", gap: 12 }}>
              <div className="row">
                {r.doc_type === "business_doc" ? (
                  <div className="field"><span className="label">Document type</span><span style={{ minHeight: 38, display: "flex", alignItems: "center" }}>Business document</span></div>
                ) : (
                  <Field label="Document type" id={`dt-${i}`}>
                    <select id={`dt-${i}`} className="select" value={r.doc_type} onChange={(e) => setRow(i, { doc_type: e.target.value as KycDocType })}>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver&apos;s license</option>
                    </select>
                  </Field>
                )}
                <Field label={r.doc_type === "business_doc" ? "Formation or EIN document (PDF or image)" : "Government ID (PDF or image)"} id={`f-${i}`}>
                  <input id={`f-${i}`} className="input" type="file" accept="image/*,application/pdf" onChange={(e) => setRow(i, { file: e.target.files?.[0] ?? null })} required />
                </Field>
              </div>
              {r.file ? <span className="help">Selected: {r.file.name}</span> : null}
            </div>
          ))}
          {kind === "business" || rows.length < 2 ? (
            <div>
              <button type="button" className="btn btn-sm" onClick={() => setRows((r) => [...r, { doc_type: "drivers_license", file: null }])}>Add another ID document</button>
            </div>
          ) : null}
        </div>
        <ActionError error={submit.error} />
      </div>
      <div className="card-f">
        <button className="btn btn-primary" type="submit" disabled={submit.pending || !valid}>{submit.pending ? "Uploading" : "Submit for verification"}</button>
      </div>
    </form>
  );
}
