"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { api, type LegInput, type TripIntake, type TripType } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { isUnresolved, joinDepart, splitDepart } from "@/lib/rules";
import { AirportInput } from "./AirportInput";
import { ActionError, Banner, Field } from "./ui";

const TYPES: { id: TripType; label: string }[] = [
  { id: "one_way", label: "One way" },
  { id: "round_trip", label: "Round trip" },
  { id: "multi_leg", label: "Multi leg" },
];
const blankLeg = (): LegInput => ({ origin_icao: "", destination_icao: "", depart_at: null });

interface Form {
  trip_type: TripType;
  legs: LegInput[];
  passengers: string;
  checked_bags: string;
  carry_on_bags: string;
  golf_bags: string;
  ski_bags: string;
}
const initial: Form = { trip_type: "one_way", legs: [blankLeg()], passengers: "", checked_bags: "0", carry_on_bags: "0", golf_bags: "0", ski_bags: "0" };

export function TripForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const fromEmptyLeg = sp.get("empty_leg");
  const [text, setText] = useState("");
  const [form, setForm] = useState<Form>(() => {
    const o = sp.get("origin"), d = sp.get("destination"), date = sp.get("date");
    return o && d ? { ...initial, legs: [{ origin_icao: o, destination_icao: d, depart_at: date ? `${date}T09:00:00` : null }] } : initial;
  });
  const [unresolved, setUnresolved] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const intake = useAction(api.intake);
  const create = useAction(api.createTrip);

  const setLeg = (i: number, patch: Partial<LegInput>) => setForm((f) => ({ ...f, legs: f.legs.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  function setType(t: TripType) {
    setForm((f) => {
      if (t === "one_way") return { ...f, trip_type: t, legs: [f.legs[0] ?? blankLeg()] };
      if (t === "round_trip") {
        const a = f.legs[0] ?? blankLeg();
        const b = f.legs[1] ?? { origin_icao: a.destination_icao, destination_icao: a.origin_icao, depart_at: null };
        return { ...f, trip_type: t, legs: [a, b] };
      }
      const legs = f.legs.length >= 2 ? f.legs : [...f.legs, blankLeg()];
      return { ...f, trip_type: t, legs };
    });
  }

  async function runIntake() {
    const r: TripIntake | undefined = await intake.run(text);
    if (!r) return;
    setForm({
      trip_type: r.trip_type,
      legs: r.legs.length ? r.legs : [blankLeg()],
      passengers: r.passengers ? String(r.passengers) : "",
      checked_bags: String(r.checked_bags ?? 0),
      carry_on_bags: String(r.carry_on_bags ?? 0),
      golf_bags: String(r.golf_bags ?? 0),
      ski_bags: String(r.ski_bags ?? 0),
    });
    setUnresolved(r.unresolved ?? []);
    setNote(r.unresolved?.length ? `Filled what we could read. ${r.unresolved.length} ${r.unresolved.length === 1 ? "field needs" : "fields need"} your input, highlighted below.` : "Filled from your description. Check each field before continuing.");
  }

  const paxN = Number(form.passengers);
  const legsOk = form.legs.every((l) => l.origin_icao && l.destination_icao && l.depart_at);
  const valid = legsOk && paxN >= 1 && form.legs.every((l) => l.origin_icao !== l.destination_icao);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = (s: string) => Math.max(0, Number(s) || 0);
    const t = await create.run({
      trip_type: form.trip_type,
      legs: form.legs,
      passengers: paxN,
      checked_bags: n(form.checked_bags),
      carry_on_bags: n(form.carry_on_bags),
      golf_bags: n(form.golf_bags),
      ski_bags: n(form.ski_bags),
    });
    if (t) router.push(`/trips/${t.id}`);
  }

  const num = (k: keyof Form, label: string, min = 0, extra?: { flag?: boolean }) => (
    <Field label={label} id={k} flag={extra?.flag}>
      <input id={k} className="input" type="number" inputMode="numeric" min={min} max={99} value={form[k] as string} onChange={(e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setUnresolved((u) => u.filter((x) => x !== k)); }} />
    </Field>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {fromEmptyLeg ? <Banner tone="neutral">Prefilled from an empty leg. Add passengers and bags; the matching aircraft appear on the next screen and you send the RFQ from there. The operator quotes the flight.</Banner> : null}
      <section className="card" aria-labelledby="intake-h">
        <div className="card-h"><h2 id="intake-h">Describe the trip</h2><span className="muted small">Optional. Fills the form below.</span></div>
        <div className="card-b" style={{ display: "grid", gap: 12 }}>
          <label className="sr-only" htmlFor="intake">Trip description in plain language</label>
          <textarea id="intake" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Teterboro to Van Nuys next Friday 9am, 6 passengers, 4 checked bags, 2 golf bags" />
          <ActionError error={intake.error} />
          {note ? <Banner tone={unresolved.length ? "wait" : "ok"} live>{note}</Banner> : <div aria-live="polite" />}
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
          {form.legs.map((l, i) => {
            const d = splitDepart(l.depart_at);
            const dateFlag = isUnresolved(unresolved, "depart_at", i);
            return (
              <fieldset key={i} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                <legend className="eyebrow" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Leg {i + 1}</span>
                  {form.trip_type === "multi_leg" && form.legs.length > 2 ? (
                    <button type="button" className="link-btn" onClick={() => setForm((f) => ({ ...f, legs: f.legs.filter((_, j) => j !== i) }))} aria-label={`Remove leg ${i + 1}`} style={{ display: "inline-flex", gap: 4, alignItems: "center", minHeight: 24 }}><Trash2 size={14} aria-hidden /> Remove</button>
                  ) : null}
                </legend>
                <div className="grid4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                  <AirportInput id={`o-${i}`} label="From" value={l.origin_icao} onChange={(v) => { setLeg(i, { origin_icao: v }); setUnresolved((u) => u.filter((x) => !isUnresolved([x], "origin_icao", i))); }} flag={isUnresolved(unresolved, "origin_icao", i) && !l.origin_icao} />
                  <AirportInput id={`d-${i}`} label="To" value={l.destination_icao} onChange={(v) => { setLeg(i, { destination_icao: v }); setUnresolved((u) => u.filter((x) => !isUnresolved([x], "destination_icao", i))); }} flag={isUnresolved(unresolved, "destination_icao", i) && !l.destination_icao} />
                  <Field label="Departure date" id={`dt-${i}`} flag={dateFlag && !d.date}>
                    <input id={`dt-${i}`} className="input" type="date" value={d.date} onChange={(e) => setLeg(i, { depart_at: joinDepart(e.target.value, d.time) })} />
                  </Field>
                  <Field label="Time (local to origin)" id={`tm-${i}`} flag={(isUnresolved(unresolved, "depart_time", i)) && !d.time}>
                    <input id={`tm-${i}`} className="input" type="time" value={d.time} onChange={(e) => setLeg(i, { depart_at: joinDepart(d.date, e.target.value) })} />
                  </Field>
                </div>
              </fieldset>
            );
          })}
          {form.trip_type === "multi_leg" && form.legs.length < 6 ? (
            <div><button type="button" className="btn btn-sm" onClick={() => setForm((f) => ({ ...f, legs: [...f.legs, { origin_icao: f.legs[f.legs.length - 1]?.destination_icao ?? "", destination_icao: "", depart_at: null }] }))}><Plus size={14} aria-hidden /> Add leg</button></div>
          ) : null}
          <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
          <div className="grid4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {num("passengers", "Passengers", 1, { flag: isUnresolved(unresolved, "passengers") && !form.passengers })}
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
