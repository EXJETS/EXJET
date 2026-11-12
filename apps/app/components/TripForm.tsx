"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { api, ApiError, type TripIntake, type TripType } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { isUnresolved } from "@/lib/rules";
import { AirportChip, AirportInput } from "./AirportInput";
import { ActionError, Banner, Field } from "./ui";

const TYPES: { id: TripType; label: string }[] = [
  { id: "one_way", label: "One way" },
  { id: "round_trip", label: "Round trip" },
  { id: "multi_leg", label: "Multi leg" },
];

interface FormLeg { origin: string; dest: string; date: string; time: string }
const blankLeg = (): FormLeg => ({ origin: "", dest: "", date: "", time: "" });

interface Form {
  trip_type: TripType;
  legs: FormLeg[];
  passengers: string;
  checked_bags: string;
  carry_on_bags: string;
  golf_bags: string;
  ski_bags: string;
}
const initial: Form = { trip_type: "one_way", legs: [blankLeg()], passengers: "", checked_bags: "0", carry_on_bags: "0", golf_bags: "0", ski_bags: "0" };

/** `2026-11-13T09:00:00-05:00` -> `09:00` (airport-local wall time, offset ignored). */
const wallTime = (s: string | null | undefined) => (s && /T(\d{2}:\d{2})/.exec(s)?.[1]) || "";

/**
 * The API requires departure times with a UTC offset and only the server knows each airport's zone, so manually
 * entered times are resolved through POST /trips/intake (deterministic parse of "ORIGIN to DEST on DATE TIME").
 */
async function resolveDeparture(l: FormLeg): Promise<string> {
  const r = await api.intake(`${l.origin} to ${l.dest} on ${l.date} ${l.time || "09:00"}, 1 passenger`);
  const at = r.legs[0]?.depart_at;
  if (!at) throw new ApiError(422, "invalid_departure", `Could not resolve the departure time for ${l.origin} to ${l.dest}. Check the airports and date.`);
  return at;
}

export function TripForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const emptyLegId = sp.get("empty_leg");
  const emptyLegListing = sp.get("listing");
  const [text, setText] = useState("");
  const [form, setForm] = useState<Form>(() => {
    const o = sp.get("origin"), d = sp.get("destination"), date = sp.get("date");
    return o && d ? { ...initial, legs: [{ origin: o, dest: d, date: date ?? "", time: "" }] } : initial;
  });
  const [unresolved, setUnresolved] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const intake = useAction(api.intake);
  const create = useAction(async (f: Form) => {
    const legs = await Promise.all(f.legs.map(async (l) => ({ origin_icao: l.origin, destination_icao: l.dest, depart_at: await resolveDeparture(l) })));
    const n = (s: string) => Math.max(0, Number(s) || 0);
    return api.createTrip({ trip_type: f.trip_type, legs, passengers: Number(f.passengers), checked_bags: n(f.checked_bags), carry_on_bags: n(f.carry_on_bags), golf_bags: n(f.golf_bags), ski_bags: n(f.ski_bags), raw_request: text.trim() || null });
  });

  const setLeg = (i: number, patch: Partial<FormLeg>) => setForm((f) => ({ ...f, legs: f.legs.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const clearUnresolved = (field: string, i?: number) => setUnresolved((u) => u.filter((x) => !(i === undefined ? x === field : isUnresolved([x], field, i))));

  function setType(t: TripType) {
    setForm((f) => {
      if (t === "one_way") return { ...f, trip_type: t, legs: [f.legs[0] ?? blankLeg()] };
      if (t === "round_trip") {
        const a = f.legs[0] ?? blankLeg();
        return { ...f, trip_type: t, legs: [a, f.legs[1] ?? { origin: a.dest, dest: a.origin, date: "", time: "" }] };
      }
      return { ...f, trip_type: t, legs: f.legs.length >= 2 ? f.legs : [...f.legs, blankLeg()] };
    });
  }

  async function runIntake() {
    const r: TripIntake | undefined = await intake.run(text);
    if (!r) return;
    setForm({
      trip_type: r.trip_type as TripType,
      legs: r.legs.length ? r.legs.map((l) => ({ origin: l.origin_icao ?? "", dest: l.destination_icao ?? "", date: l.depart_date ?? (l.depart_at ? l.depart_at.slice(0, 10) : ""), time: wallTime(l.depart_at) })) : [blankLeg()],
      passengers: r.passengers ? String(r.passengers) : "",
      checked_bags: String(r.checked_bags ?? 0),
      carry_on_bags: String(r.carry_on_bags ?? 0),
      golf_bags: String(r.golf_bags ?? 0),
      ski_bags: String(r.ski_bags ?? 0),
    });
    setUnresolved(r.unresolved ?? []);
    setCandidates((r.candidates ?? {}) as Record<string, string[]>);
    setNotes(r.interpretation_notes ?? []);
    setNote(r.unresolved?.length ? `Filled what we could read. ${r.unresolved.length} ${r.unresolved.length === 1 ? "field needs" : "fields need"} your input, highlighted below.` : "Filled from your description. Check each field before continuing.");
  }

  const paxN = Number(form.passengers);
  const valid = form.legs.every((l) => l.origin && l.dest && l.date && l.time && l.origin !== l.dest) && paxN >= 1;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = await create.run(form);
    if (t) {
      const q = emptyLegId ? `?empty_leg=${encodeURIComponent(emptyLegId)}${emptyLegListing ? `&listing=${encodeURIComponent(emptyLegListing)}` : ""}` : "";
      router.push(`/trips/${t.id}${q}`);
    }
  }

  const num = (k: "passengers" | "checked_bags" | "carry_on_bags" | "golf_bags" | "ski_bags", label: string, min = 0, flag?: boolean) => (
    <Field label={label} id={k} flag={flag}>
      <input id={k} className="input" type="number" inputMode="numeric" min={min} max={99} value={form[k]} onChange={(e) => { setForm((f) => ({ ...f, [k]: e.target.value })); clearUnresolved(k); }} />
    </Field>
  );

  const chips = (field: string, i: number, set: (icao: string) => void) => {
    const key = Object.keys(candidates).find((k) => isUnresolved([k], field, i));
    const list = key ? candidates[key] : undefined;
    if (!list?.length) return null;
    return (
      <div style={{ gridColumn: "1 / -1" }} role="group" aria-label={`Did you mean, leg ${i + 1} ${field === "origin_icao" ? "origin" : "destination"}`}>
        <span className="help">Did you mean: </span>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {list.map((c) => <AirportChip key={c} icao={c} onPick={(v) => { set(v); clearUnresolved(field, i); }} />)}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {emptyLegId ? <Banner tone="neutral">Prefilled from an empty leg. Add passengers and bags; on the next screen you send the RFQ for that aircraft. The operator quotes the flight.</Banner> : null}
      <section className="card" aria-labelledby="intake-h">
        <div className="card-h"><h2 id="intake-h">Describe the trip</h2><span className="muted small">Optional. Fills the form below.</span></div>
        <div className="card-b" style={{ display: "grid", gap: 12 }}>
          <label className="sr-only" htmlFor="intake">Trip description in plain language</label>
          <textarea id="intake" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Teterboro to Van Nuys next Friday 9am, 6 passengers, 4 checked bags, 2 golf bags" />
          <ActionError error={intake.error} />
          {note ? <Banner tone={unresolved.length ? "wait" : "ok"} live>{note}</Banner> : <div aria-live="polite" />}
          {notes.length ? (
            <Banner tone="wait"><ul style={{ margin: 0, paddingLeft: 16 }}>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul></Banner>
          ) : null}
          <div><button type="button" className="btn" onClick={runIntake} disabled={intake.pending || text.trim().length < 5}><Wand2 size={16} aria-hidden /> {intake.pending ? "Reading" : "Fill the form"}</button></div>
        </div>
      </section>

      <form className="card" onSubmit={submit} aria-labelledby="form-h">
        <div className="card-h">
          <h2 id="form-h">Trip details</h2>
          <div role="radiogroup" aria-label="Trip type" className="seg">
            {TYPES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={form.trip_type === t.id} onClick={() => setType(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="card-b" style={{ display: "grid", gap: 20 }}>
          {form.legs.map((l, i) => (
            <fieldset key={i} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
              <legend className="eyebrow" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span>Leg {i + 1}</span>
                {form.trip_type === "multi_leg" && form.legs.length > 2 ? (
                  <button type="button" className="link-btn" onClick={() => setForm((f) => ({ ...f, legs: f.legs.filter((_, j) => j !== i) }))} aria-label={`Remove leg ${i + 1}`} style={{ display: "inline-flex", gap: 4, alignItems: "center", minHeight: 24 }}><Trash2 size={14} aria-hidden /> Remove</button>
                ) : null}
              </legend>
              <div className="grid4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                <AirportInput id={`o-${i}`} label="From" value={l.origin} onChange={(v) => { setLeg(i, { origin: v }); clearUnresolved("origin_icao", i); }} flag={isUnresolved(unresolved, "origin_icao", i) && !l.origin} />
                <AirportInput id={`d-${i}`} label="To" value={l.dest} onChange={(v) => { setLeg(i, { dest: v }); clearUnresolved("destination_icao", i); }} flag={isUnresolved(unresolved, "destination_icao", i) && !l.dest} />
                <Field label="Departure date" id={`dt-${i}`} flag={isUnresolved(unresolved, "depart_at", i) && !l.date}>
                  <input id={`dt-${i}`} className="input" type="date" value={l.date} onChange={(e) => setLeg(i, { date: e.target.value })} />
                </Field>
                <Field label="Time (local to origin)" id={`tm-${i}`} flag={isUnresolved(unresolved, "depart_at", i) && !l.time}>
                  <input id={`tm-${i}`} className="input" type="time" value={l.time} onChange={(e) => { setLeg(i, { time: e.target.value }); }} />
                </Field>
                {chips("origin_icao", i, (v) => setLeg(i, { origin: v }))}
                {chips("destination_icao", i, (v) => setLeg(i, { dest: v }))}
              </div>
            </fieldset>
          ))}
          {form.trip_type === "multi_leg" && form.legs.length < 6 ? (
            <div><button type="button" className="btn btn-sm" onClick={() => setForm((f) => ({ ...f, legs: [...f.legs, { origin: f.legs[f.legs.length - 1]?.dest ?? "", dest: "", date: "", time: "" }] }))}><Plus size={14} aria-hidden /> Add leg</button></div>
          ) : null}
          <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
          <div className="grid4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {num("passengers", "Passengers", 1, isUnresolved(unresolved, "passengers") && !form.passengers)}
            {num("checked_bags", "Checked bags")}
            {num("carry_on_bags", "Carry-on")}
            {num("golf_bags", "Golf bags")}
            {num("ski_bags", "Ski bags")}
          </div>
          <ActionError error={create.error} />
        </div>
        <div className="card-f">
          <span className="muted small" style={{ marginRight: "auto" }}>No price is shown until an operator quotes.</span>
          <button className="btn btn-primary" type="submit" disabled={!valid || create.pending}>{create.pending ? "Saving" : "Continue to aircraft"}</button>
        </div>
      </form>
    </div>
  );
}
