"use client";

import { useEffect, useState } from "react";
import { api, type IdType, type Manifest, type ManifestRow, type Trip } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { countdown, emptyPassenger, enforceIdType, formatWhen, idTypeLabel, manifestComplete, validatePassenger } from "@/lib/rules";
import { ActionError, Async, Banner, Card, Chip, Field } from "../ui";

function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function Editor({ trip, m, onChange }: { trip: Trip; m: Manifest; onChange: () => void }) {
  const req = m.required_id_type as IdType;
  const submitted = !!m.submitted_at;
  const expected = m.expected_passengers;
  const init = (): ManifestRow[] => {
    // The API never returns the full ID number (last 4 only), so saved rows must have it re-entered to save again.
    const rows: ManifestRow[] = m.passengers.slice(0, expected).map((p) => ({
      full_name: p.full_name, date_of_birth: p.date_of_birth, id_type: p.id_type as IdType, id_number: "", id_number_last4: p.id_number_last4,
      id_expiry: p.id_expiry ?? "", id_issuer: p.id_issuer ?? "",
    }));
    while (rows.length < expected) rows.push(emptyPassenger(req));
    return enforceIdType(rows, req);
  };
  const [rows, setRows] = useState<ManifestRow[]>(init);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = useAction(api.saveManifest);
  const submit = useAction(api.submitManifest);
  const now = useNow();
  const due = countdown(m.due_at, now);

  const set = (i: number, patch: Partial<ManifestRow>) => { setSaved(false); setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x))); };
  const complete = manifestComplete(rows, req, expected);

  async function doSave() {
    setTouched(true);
    const r = await save.run(trip.id, rows.map(({ id_number_last4: _l, ...p }) => { void _l; return p; }));
    if (r) setSaved(true);
    return r;
  }
  async function doSubmit() {
    setTouched(true);
    if (!complete) return;
    const r = await doSave();
    if (!r) return;
    const t = await submit.run(trip.id);
    if (t) onChange();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="grid3">
        <div><div className="eyebrow">Due</div><div style={{ fontWeight: 500 }}>{formatWhen(m.due_at)}</div><div className="muted small">24 hours before first departure</div></div>
        <div>
          <div className="eyebrow">{submitted ? "Submitted" : due.overdue ? "Overdue by" : "Time remaining"}</div>
          <div style={{ fontWeight: 500 }} aria-live="off">{submitted ? formatWhen(m.submitted_at) : due.text}</div>
          <div>{submitted ? <Chip tone="ok">Submitted</Chip> : <Chip tone={due.overdue ? "problem" : "wait"}>{due.overdue ? "Past due" : "Open"}</Chip>}</div>
        </div>
        <div><div className="eyebrow">Required ID</div><div style={{ fontWeight: 500 }}>{idTypeLabel(req)}</div><div className="muted small">{req === "passport" ? "At least one leg is international" : "Domestic trip"}</div></div>
      </div>
      {rows.map((p, i) => {
        const e = touched ? validatePassenger(p, req) : {};
        const id = `p${i}`;
        return (
          <fieldset key={i} className="pax" style={{ minWidth: 0, margin: 0, padding: 0 }}>
            <legend className="sr-only">Passenger {i + 1}</legend>
            <div className="pax-h" aria-hidden>Passenger {i + 1}</div>
            <div className="pax-b">
              <Field className="w2" label="Full legal name" id={`${id}-n`} error={e.full_name}><input id={`${id}-n`} className="input" disabled={submitted} value={p.full_name} onChange={(ev) => set(i, { full_name: ev.target.value })} autoComplete="off" aria-invalid={!!e.full_name} /></Field>
              <Field label="Date of birth" id={`${id}-b`} error={e.date_of_birth}><input id={`${id}-b`} className="input" type="date" disabled={submitted} value={p.date_of_birth} onChange={(ev) => set(i, { date_of_birth: ev.target.value })} aria-invalid={!!e.date_of_birth} /></Field>
              <Field label="ID type" id={`${id}-t`} help="Set by the trip route"><select id={`${id}-t`} className="select" value={req} disabled><option value={req}>{idTypeLabel(req)}</option></select></Field>
              <Field label="ID number" id={`${id}-i`} error={e.id_number} help={p.id_number_last4 ? `Saved ending ${p.id_number_last4}. Re-enter to save again.` : undefined}><input id={`${id}-i`} className="input mono" disabled={submitted} placeholder={p.id_number_last4 ? `ending ${p.id_number_last4}` : undefined} value={p.id_number} onChange={(ev) => set(i, { id_number: ev.target.value })} autoComplete="off" aria-invalid={!!e.id_number} /></Field>
              <Field label="Expiry" id={`${id}-e`} error={e.id_expiry}><input id={`${id}-e`} className="input" type="date" disabled={submitted} value={p.id_expiry} onChange={(ev) => set(i, { id_expiry: ev.target.value })} aria-invalid={!!e.id_expiry} /></Field>
              <Field label={req === "passport" ? "Issuing country" : "Issuing state"} id={`${id}-s`} error={e.id_issuer}><input id={`${id}-s`} className="input" disabled={submitted} value={p.id_issuer} onChange={(ev) => set(i, { id_issuer: ev.target.value })} autoComplete="off" aria-invalid={!!e.id_issuer} /></Field>
            </div>
          </fieldset>
        );
      })}
      <div aria-live="polite">{saved && !submitted ? <Banner tone="ok">Draft saved.</Banner> : null}</div>
      <ActionError error={save.error ?? submit.error} />
      {!submitted ? (
        <div className="actions">
          <button className="btn" onClick={doSave} disabled={save.pending || submit.pending}>{save.pending && !submit.pending ? "Saving" : "Save draft"}</button>
          <button className="btn btn-primary" onClick={doSubmit} disabled={save.pending || submit.pending}>{submit.pending ? "Submitting" : "Submit manifest"}</button>
          {touched && !complete ? <span className="field-err" role="alert">Complete every passenger record to submit.</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function ManifestSection({ trip, locked, onChange }: { trip: Trip; locked: boolean; onChange: () => void }) {
  const q = useApi<Manifest>(locked ? null : `manifest:${trip.id}`, () => api.manifest(trip.id));
  if (locked) {
    return (
      <Card id="manifest" num="07" title="Manifest">
        <p className="muted">Opens after payment is marked. Due 24 hours before departure. Passenger ID is REAL ID for domestic trips and passport for international trips.</p>
      </Card>
    );
  }
  return (
    <Card id="manifest" num="07" title="Manifest">
      <Async q={q}>{(m) => <Editor key={`${trip.id}-${m.submitted_at ?? "open"}`} trip={trip} m={m} onChange={onChange} />}</Async>
    </Card>
  );
}
