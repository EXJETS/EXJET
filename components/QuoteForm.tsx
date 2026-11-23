"use client";

import { CharterIcon } from "./CharterVisuals";
import { CharterEstimate } from "./CharterEstimate";
import Link from "next/link";
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { localDate } from "./localDate";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { siteConfig } from "@/data/site";
import styles from "./QuoteItinerary.module.css";

type QuoteMode = "charter" | "cargo" | "group";
type Airport = { icao: string; iata?: string; name: string; city?: string; country?: string };

type QuoteFormProps = {
  mode?: QuoteMode;
  compact?: boolean;
};

const tripTypes = [
  ["one_way", "One way"],
  ["round_trip", "Round trip"],
  ["multi_leg", "Multi leg"],
] as const;
const categories = [
  { value: "midsize", label: "Midsize", seats: 8 },
  { value: "large", label: "Large", seats: 9 },
  { value: "heavy", label: "Heavy", seats: 13 },
  { value: "ulr", label: "Ultra long range (ULR)", seats: 16 },
] as const;
const maxLegs = 6;
type TripType = (typeof tripTypes)[number][0];
type Category = (typeof categories)[number]["value"];
type Leg = {
  departure: string;
  departureIcao: string;
  destination: string;
  destinationIcao: string;
  date: string;
  time: string;
};
type AdditionalLeg = Leg & { id: number };

function newLeg(id: number): AdditionalLeg {
  return { id, departure: "", departureIcao: "", destination: "", destinationIcao: "", date: "", time: "" };
}

function legOnly({ departure, departureIcao, destination, destinationIcao, date, time }: Leg): Leg {
  return { departure, departureIcao, destination, destinationIcao, date, time };
}

type FormState = Leg & {
  passengers: string;
  cargoType: string;
  name: string;
  email: string;
  phone: string;
  contactPreference: "text" | "call" | "email";
  notes: string;
  website: string;
};

const initialState: FormState = {
  departure: "",
  departureIcao: "",
  destination: "",
  destinationIcao: "",
  date: "",
  time: "",
  passengers: "2",
  cargoType: "",
  name: "",
  email: "",
  phone: "",
  contactPreference: "text",
  notes: "",
  website: "",
};

function AirportInput({ label, value, code, onChange }: {
  label: string; value: string; code: string; onChange: (value: string, icao?: string) => void;
}) {
  const id = useId();
  const listId = `${id}-options`;
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const choose = (airport: Airport) => {
    const title = [airport.city, airport.name].filter(Boolean).join(" · ");
    const codes = [airport.iata, airport.icao].filter(Boolean).join(" / ");
    onChange(`${title} (${codes})`, airport.icao);
    setOpen(false); setActive(-1);
  };
  useEffect(() => {
    if (value.trim().length < 2 || code) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/airports/?q=${encodeURIComponent(value.trim())}`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json() as { items?: Airport[] };
        if (controller.signal.aborted) return;
        setItems(payload.items ?? []);
        setActive(-1);
        setOpen(document.activeElement === input.current && Boolean(payload.items?.length));
      } catch { /* A plain-text airport remains valid if lookup is unavailable. */ }
    }, 280);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [code, value]);
  return <div className="quote-form__airport">
    <label htmlFor={id}>{label}</label>
    <input ref={input} id={id} value={value} maxLength={120} required pattern={String.raw`.*\S.*`} title="Enter a city or airport." autoComplete="off"
      placeholder="City, airport, IATA or ICAO" role="combobox" aria-autocomplete="list"
      aria-expanded={open} aria-controls={open ? listId : undefined}
      aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
      onChange={event => { setItems([]); setOpen(false); setActive(-1); onChange(event.target.value); }}
      onFocus={() => setOpen(!code && Boolean(items.length))} onBlur={() => setOpen(false)}
      onKeyDown={event => {
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length && !code) {
          event.preventDefault(); setOpen(true);
          setActive(current => event.key === "ArrowDown" ? (current + 1) % items.length : (current <= 0 ? items.length - 1 : current - 1));
        } else if (event.key === "Enter" && open && active >= 0) {
          event.preventDefault(); choose(items[active]);
        } else if (event.key === "Escape") { setOpen(false); setActive(-1); }
      }} />
    {code ? <small>{code} selected</small> : null}
    {open ? <div id={listId} className="quote-form__airport-list" role="listbox" aria-label={`${label} suggestions`}>
      {items.map((airport, index) => <button id={`${id}-${index}`} key={airport.icao} type="button" role="option" tabIndex={-1}
        aria-selected={active === index} onPointerDown={event => event.preventDefault()} onClick={() => choose(airport)}>
        <strong>{[airport.city, airport.name].filter(Boolean).join(" · ")}</strong>
        <small>{[airport.iata, airport.icao].filter(Boolean).join(" / ")}{airport.country ? ` · ${airport.country}` : ""}</small>
      </button>)}
    </div> : null}
  </div>;
}

export function QuoteForm({ mode = "charter", compact = false }: QuoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const nextLegId = useRef(3);
  const categoryId = useId();
  const passengerId = useId();
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [returnLeg, setReturnLeg] = useState(() => newLeg(1));
  const [followingLegs, setFollowingLegs] = useState<AdditionalLeg[]>(() => [newLeg(2)]);
  const [category, setCategory] = useState<Category | "">("");
  const [stage, setStage] = useState<"mission" | "results" | "contact" | "success">("mission");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [form, setForm] = useState<FormState>({ ...initialState, passengers: mode === "group" ? "25" : "2" });
  const useSearch = mode === "charter";
  const searchTitle = useRef<HTMLHeadingElement>(null);
  const recipient = mode === "cargo" ? siteConfig.email.cargo : siteConfig.email.charter;
  const today = useMemo(() => localDate(), []);
  const passengerCount = Number(form.passengers);
  const groupHandled = mode === "charter" && Number.isFinite(passengerCount) && passengerCount > 16;
  const selectedCategory = categories.find(item => item.value === category && passengerCount <= item.seats);
  const tripLabel = tripTypes.find(([value]) => value === tripType)?.[1];
  const outbound = legOnly(form);
  const reversedReturn: Leg = {
    departure: outbound.destination, departureIcao: outbound.destinationIcao,
    destination: outbound.departure, destinationIcao: outbound.departureIcao,
    date: returnLeg.date, time: returnLeg.time,
  };
  const legs = [outbound, ...(tripType === "round_trip" ? [reversedReturn] : tripType === "multi_leg" ? followingLegs.map(legOnly) : [])];

  const updateFollowingLeg = (id: number, patch: Partial<Leg>) => {
    setFollowingLegs(current => current.map(leg => leg.id === id ? { ...leg, ...patch } : leg));
  };

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (submitting.current) return;
    if (stage === "results") {
      setStage("contact");
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus(), 0);
      return;
    }
    if (stage === "mission") {
      const fields = new FormData(event.currentTarget);
      const read = (key: string, fallback: string) => String(fields.get(key) ?? fallback);
      const count = Number(read("passengers", form.passengers));
      const tripLegs = (mode === "cargo" ? [outbound] : legs).map((leg, index) => {
        const prefix = index === 0 ? "" : tripType === "round_trip" ? "return-" : `leg-${followingLegs[index - 1].id}-`;
        return { ...leg, date: read(prefix + "date", leg.date), time: read(prefix + "time", leg.time) };
      });
      for (const [index, leg] of tripLegs.entries()) {
        const origin = (leg.departureIcao || leg.departure).trim().toUpperCase();
        const destination = (leg.destinationIcao || leg.destination).trim().toUpperCase();
        const prefix = tripLegs.length > 1 ? `Leg ${index + 1}: ` : "";
        if (origin.length < 2 || destination.length < 2 || origin === destination) {
          setStatus("error");
          setMessage(`${prefix}Choose different departure and arrival airports.`);
          return;
        }
        if (!leg.date || leg.date < today || (index > 0 && leg.date < tripLegs[index - 1].date)) {
          setStatus("error");
          setMessage(`${prefix}Choose a valid date that isn’t before the preceding flight.`);
          return;
        }
      }
      if (mode !== "cargo" && (!Number.isInteger(count) || count < 1 || count > 100)) {
        setStatus("error"); setMessage("Enter a whole number between 1 and 100 for passengers."); return;
      }
      setForm(current => ({ ...current, date: tripLegs[0].date, time: tripLegs[0].time, cargoType: read("cargoType", current.cargoType), passengers: read("passengers", current.passengers) }));
      if (mode !== "cargo") {
        if (tripType === "round_trip") setReturnLeg(current => ({ ...current, date: tripLegs[1].date, time: tripLegs[1].time }));
        if (tripType === "multi_leg") setFollowingLegs(current => current.map((leg,index) => ({ ...leg, date: tripLegs[index + 1].date, time: tripLegs[index + 1].time })));
        if (!selectedCategory || count > selectedCategory.seats) setCategory(categories.find(item => item.seats >= count)?.value ?? "");
      }
      setStatus("idle");
      setStage(useSearch ? "results" : "contact");
      window.setTimeout(() => useSearch ? searchTitle.current?.focus() : formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus(), 0);
      return;
    }
    if (stage !== "contact") return;
    if (form.name.trim().length < 2 || form.phone.replace(/\D/g, "").length < 7) {
      setStatus("error");
      setMessage("Enter your name and a valid contact number, or email the desk below.");
      return;
    }
    submitting.current = true;
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/requests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: groupHandled ? "group" : mode,
          ...form,
          ...(mode !== "cargo" ? { tripType, legs, ...(selectedCategory ? { aircraftCategory: selectedCategory.value } : {}) } : {}),
          source: window.location.pathname,
        }),
        signal: AbortSignal.timeout(45_000),
      });
      const payload = (await response.json()) as { ok?: boolean; reference?: string };
      if (response.status !== 201 || payload.ok !== true || !payload.reference) {
        throw new Error("The request was not confirmed.");
      }
      setReference(payload.reference);
      setStage("success");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("We did not receive confirmation. Email the desk below for assistance.");
    } finally {
      submitting.current = false;
    }
  };

  const subject = mode === "cargo" ? "Cargo charter request" : mode === "group" || groupHandled ? "Group charter request" : "Private charter request";
  const fallbackBody = [
    subject,
    ...(mode === "cargo" ? [`From: ${form.departure}`, `To: ${form.destination}`, `Date: ${form.date}`, `Cargo: ${form.cargoType}`] : [
      `Trip type: ${tripLabel}`,
      ...legs.map((leg, index) => `Leg ${index + 1}: ${leg.departure || "Not specified"} to ${leg.destination || "Not specified"} · ${leg.date || "Date not specified"}${leg.time ? ` at ${leg.time} local` : ""}`),
      `Passengers: ${form.passengers}`,
      `Preferred aircraft category: ${selectedCategory?.label ?? "No preference"}`,
    ]),
    `Name: ${form.name}`, `Mobile: ${form.phone}`, `Email: ${form.email}`, `Notes: ${form.notes}`,
  ].join("\n");
  const emailHref = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fallbackBody)}`;
  const notesLabel = mode === "cargo" ? "Shipment details" : mode === "group" ? "Group details" : "Anything else we should know?";
  const notesPlaceholder = mode === "cargo"
    ? "Dimensions, weight, handling requirements, timing, permits..."
    : mode === "group"
      ? "Baggage, equipment, ground transport, schedule..."
      : "Schedule flexibility, pets, baggage, ground coordination...";

  if (stage === "success") {
    return (
      <section className={`quote-form quote-form--${mode}${compact ? " quote-form--compact" : ""} quote-form--success`} aria-live="polite">
        <p className="quote-form__kicker">Request received</p>
        <CheckCircleIcon size={32} aria-hidden="true" /><h3 tabIndex={-1} ref={element => { element?.focus(); }}>Your request has been sent.</h3>
        <p>This request does not reserve an aircraft. For a time-sensitive change, <a href={`mailto:${recipient}`}>email the EXJET flight desk</a> and include your reference.</p>
        <div className="quote-form__reference"><span>Reference</span><strong>{reference}</strong></div>
        <button className="quote-form__new" type="button" onClick={() => { setForm({ ...initialState, passengers: mode === "group" ? "25" : "2" }); setReference(""); setTripType("one_way"); setReturnLeg(newLeg(1)); setFollowingLegs([newLeg(2)]); setCategory(""); nextLegId.current = 3; setStage("mission"); }}>
          Start another request <ArrowRightIcon size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <form ref={formRef} className={`quote-form quote-form--${mode}${compact ? " quote-form--compact" : ""} quote-form--${stage}`} onSubmit={submit} aria-busy={status === "loading"}>
      <p className="quote-form__progress">{useSearch ? ({mission:"1 of 3 · Your trip",results:"2 of 3 · Aircraft & estimate",contact:"3 of 3 · Request a firm quote"} as const)[stage] : stage === "mission" ? mode === "cargo" ? "1 of 2 · Shipment details" : "1 of 2 · Trip details" : "2 of 2 · Contact details"}</p>
      {stage === "mission" ? (
        <>
          {mode === "cargo" ? null : <fieldset className={styles.tripType}>
            <legend>Trip type</legend>
            <div className={styles.tripChoice}>{tripTypes.map(([type,label]) => <label key={type}>
              <input type="radio" name="tripType" value={type} checked={tripType === type} onChange={() => { setTripType(type); setStatus("idle"); setMessage(""); }} />
              <span>{label}</span>
            </label>)}</div>
          </fieldset>}
          {useSearch ? <button className={styles.swap} type="button" aria-label="Swap departure and arrival" onClick={() => setForm(current => ({ ...current, departure: current.destination, departureIcao: current.destinationIcao, destination: current.departure, destinationIcao: current.departureIcao }))}>⇄ <span>Swap airports</span></button> : null}
          <div className={`quote-form__row${(compact && mode !== "cargo") || useSearch ? " quote-form__row--home-itinerary" : ""}`}>
            <AirportInput label={mode === "cargo" ? "Origin" : useSearch ? "From" : "Departure"} value={form.departure} code={form.departureIcao} onChange={(value, icao = "") => setForm((current) => ({ ...current, departure: value, departureIcao: icao }))} />
            <AirportInput label={mode === "cargo" ? "Destination" : useSearch ? "To" : "Arrival"} value={form.destination} code={form.destinationIcao} onChange={(value, icao = "") => setForm((current) => ({ ...current, destination: value, destinationIcao: icao }))} />
            <label><span>Date</span><input value={form.date} onInput={(event) => update("date", event.currentTarget.value)} name="date" type="date" min={today} required /></label>
            {(compact && mode !== "cargo") || useSearch ? <label>
              <span>Local time</span>
              <input aria-label="Local departure time (optional)" value={form.time} onInput={(event) => update("time", event.currentTarget.value)} name="time" type="time" />
            </label> : null}
            {mode === "cargo" ? (
              <label><span>Cargo type</span><input value={form.cargoType} onChange={(event) => update("cargoType", event.target.value)} name="cargoType" maxLength={160} required pattern={String.raw`.*\S.*`} title="Describe the cargo." placeholder="General description" /></label>
            ) : useSearch ? (
              <div className={styles.passengerField}>
                <label htmlFor={passengerId}>Passengers</label>
                <div>
                  <button aria-label="Decrease passengers" type="button" disabled={passengerCount <= 1} onClick={() => update("passengers", String(Math.max(1, passengerCount - 1)))}>−</button>
                  <input id={passengerId} name="passengers" value={form.passengers} onChange={event => update("passengers", event.target.value)} type="number" inputMode="numeric" min="1" max="100" step="1" required />
                  <button aria-label="Increase passengers" type="button" disabled={passengerCount >= 100} onClick={() => update("passengers", String(Math.min(100, passengerCount + 1)))}>+</button>
                </div>
              </div>
            ) : (
              <label><span>Passengers</span><input value={form.passengers} onChange={(event) => { const value = event.target.value; update("passengers", value); if (selectedCategory && Number(value) > selectedCategory.seats) setCategory(""); }} name="passengers" type="number" inputMode="numeric" min="1" max="100" step="1" required /></label>
            )}
          </div>
          {mode !== "cargo" && !compact && !useSearch ? <div className="quote-form__row"><label>
            <span>Local departure time (optional)</span>
            <input value={form.time} onInput={(event) => update("time", event.currentTarget.value)} name="time" type="time" />
          </label></div> : null}
          {mode !== "cargo" && tripType === "round_trip" ? <fieldset className={styles.segment}>
            <legend>Return flight</legend>
            <p>{reversedReturn.departure || "Arrival airport"} to {reversedReturn.destination || "Departure airport"}</p>
            <div className="quote-form__row">
              <label><span>Return date</span><input name="return-date" type="date" min={form.date || today} value={returnLeg.date} onInput={event => setReturnLeg({ ...returnLeg, date: event.currentTarget.value })} required /></label>
              <label><span>Local return time (optional)</span><input name="return-time" type="time" value={returnLeg.time} onInput={event => setReturnLeg({ ...returnLeg, time: event.currentTarget.value })} /></label>
            </div>
          </fieldset> : null}
          {mode !== "cargo" && tripType === "multi_leg" ? <>
            {followingLegs.map((leg,index) => <fieldset className={styles.segment} key={leg.id}>
              <legend>Leg {index + 2}</legend>
              <div className="quote-form__row">
                <AirportInput label="Departure" value={leg.departure} code={leg.departureIcao} onChange={(value, icao = "") => updateFollowingLeg(leg.id, { departure: value, departureIcao: icao })} />
                <AirportInput label="Arrival" value={leg.destination} code={leg.destinationIcao} onChange={(value, icao = "") => updateFollowingLeg(leg.id, { destination: value, destinationIcao: icao })} />
                <label><span>Date</span><input name={`leg-${leg.id}-date`} type="date" min={(index ? followingLegs[index - 1].date : form.date) || today} value={leg.date} onInput={event => updateFollowingLeg(leg.id, { date: event.currentTarget.value })} required /></label>
                <label><span>Local departure time (optional)</span><input name={`leg-${leg.id}-time`} type="time" value={leg.time} onInput={event => updateFollowingLeg(leg.id, { time: event.currentTarget.value })} /></label>
              </div>
              {followingLegs.length > 1 ? <div className={styles.segmentActions}>
                <button type="button" aria-label={`Remove leg ${index + 2}`} onClick={() => setFollowingLegs(current => current.filter(item => item.id !== leg.id))}>Remove leg</button>
              </div> : null}
            </fieldset>)}
            <div className={styles.segmentActions}>
              {legs.length < maxLegs ? <button type="button" onClick={() => {
                const added = newLeg(nextLegId.current++);
                const previous = followingLegs.at(-1);
                if (previous) Object.assign(added, { departure: previous.destination, departureIcao: previous.destinationIcao });
                setFollowingLegs(current => [...current, added]);
              }}>Add flight leg</button> : null}
              <small>{legs.length} of {maxLegs} legs. For more stops, email the charter desk.</small>
            </div>
          </> : null}
          {mode !== "group" ? null : <div className={styles.aircraft}>
            <label htmlFor={categoryId}>Preferred aircraft category</label>
            <select id={categoryId} value={selectedCategory?.value ?? ""} onChange={event => setCategory(event.target.value as Category | "")} aria-describedby={`${categoryId}-capacity`}>
              <option value="">No preference</option>
              {categories.map(item => <option key={item.value} value={item.value} disabled={passengerCount > item.seats}>{item.label} · up to {item.seats} passengers</option>)}
            </select>
            <small id={`${categoryId}-capacity`}>{passengerCount > 16 ? "Larger group? Leave this as No preference so we can source group options." : "If you don’t choose, we’ll estimate with the smallest category that fits. Actual seating may vary."}</small>
          </div>}
          <div className="quote-form__submit">
            <button className="button button--dark" type="submit">
              {mode === "cargo" ? "Continue to contact details" : useSearch ? "Search flights" : "See trip estimate"} {useSearch ? <CharterIcon name="search" width={18} height={18} /> : <ArrowRightIcon size={18} aria-hidden="true" />}
            </button>
            <a className="ex-text-link" href={emailHref}>Email instead</a>
            <p>{groupHandled ? "This passenger count will be routed to EXJET group charter." : useSearch ? "Compare estimated trip totals before sharing your contact details." : compact ? "One more step. No account required." : `No account required. For a time-sensitive request, email ${recipient}.`}</p>
          </div>
        </>
      ) : stage === "results" ? (
        <div className={styles.results}>
          <div className="quote-form__mission-summary">
            <button type="button" onClick={() => { setMessage(""); setStatus("idle"); setStage("mission"); }}><ArrowLeftIcon size={18} aria-hidden="true" /> Edit trip</button>
            <h3 ref={searchTitle} tabIndex={-1}>{groupHandled ? "Group charter" : "Compare aircraft categories"}</h3>
            <small>{tripLabel} · {form.passengers} passenger{form.passengers === "1" ? "" : "s"}</small>
            <ol className={styles.summaryList}>{legs.map((leg,index) => <li key={index}>{leg.departure} to {leg.destination} · {leg.date}{leg.time ? ` at ${leg.time} local` : ""}</li>)}</ol>
          </div>
          <CharterEstimate legs={legs} passengers={passengerCount} aircraftCategory={selectedCategory?.value} choices={categories.filter(item => passengerCount <= item.seats)} onSelect={value => setCategory(categories.find(item => item.value === value)?.value ?? "")} />
          <div className="quote-form__submit"><button className="button button--dark" type="submit">Continue to request <ArrowRightIcon size={18} aria-hidden="true" /></button><a className="ex-text-link" href={emailHref}>Email instead</a></div>
        </div>
      ) : (
        <>
          <div className="quote-form__mission-summary">
            <button type="button" disabled={status === "loading"} onClick={() => { setStatus("idle"); setMessage(""); setStage(useSearch ? "results" : "mission"); }}><ArrowLeftIcon size={18} aria-hidden="true" /> {mode === "cargo" ? "Edit shipment" : useSearch ? "Back to aircraft options" : "Edit trip"}</button>
            {mode === "cargo" ? <>
              <p><strong>{form.departure}</strong><ArrowRightIcon size={18} aria-hidden="true" /><strong>{form.destination}</strong></p>
              <small>{form.date} · {form.cargoType}</small>
            </> : <>
              <small>{tripLabel} · {form.passengers} traveler{form.passengers === "1" ? "" : "s"}{selectedCategory ? ` · ${selectedCategory.label}` : ""}</small>
              <ol className={styles.summaryList}>{legs.map((leg,index) => <li key={index}>{leg.departure} to {leg.destination} · {leg.date}{leg.time ? ` at ${leg.time} local` : ""}</li>)}</ol>
            </>}
          </div>
          {mode === "group" ? <CharterEstimate legs={legs} passengers={passengerCount} aircraftCategory={selectedCategory?.value} /> : null}
          <div className="quote-form__row quote-form__row--identity">
            <label><span>Name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} name="name" minLength={2} maxLength={100} pattern={String.raw`.*\S.*`} title="Enter your name." autoComplete="name" required placeholder="Your name" /></label>
            <label><span>Mobile</span><input value={form.phone} onChange={(event) => update("phone", event.target.value)} name="phone" maxLength={40} type="tel" inputMode="tel" autoComplete="tel" required placeholder="+1" /></label>
            <label><span>Email</span><input value={form.email} onChange={(event) => update("email", event.target.value)} name="email" maxLength={180} type="email" inputMode="email" autoComplete="email" required placeholder="you@company.com" /></label>
          </div>
          <fieldset className="quote-form__preference">
            <legend>How should we respond?</legend>
            {(["text", "call", "email"] as const).map((preference) => (
              <label key={preference}>
                <input type="radio" name="contactPreference" value={preference} checked={form.contactPreference === preference} onChange={() => update("contactPreference", preference)} />
                <span>{preference}</span>
              </label>
            ))}
          </fieldset>
          <label className="quote-form__notes">
            <span>{notesLabel}</span>
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} name="notes" maxLength={2500} rows={compact ? 2 : 4} placeholder={notesPlaceholder} />
          </label>
          <label className="quote-form__honeypot" aria-hidden="true"><span>Website</span><input value={form.website} onChange={(event) => update("website", event.target.value)} name="website" tabIndex={-1} autoComplete="off" /></label>
          <p className="quote-form__broker-disclosure">EXJET arranges charter as a broker. The identified licensed third-party air carrier operates the flight and retains operational control.</p>
          <div className="quote-form__submit quote-form__submit--contact">
            <button className="button button--dark" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending securely..." : useSearch ? "Request a firm quote" : "Submit request"}<ArrowRightIcon size={18} aria-hidden="true" />
            </button>
            <a className="ex-text-link" href={emailHref}>Email instead</a>
            <p>EXJET uses your {mode === "cargo" ? "shipment" : "trip"} and contact details to handle this request, including sharing them with the service providers needed for it. Read our <Link href="/privacy">privacy information</Link>. Please don’t include payment details, identification documents or medical information.</p>
          </div>
        </>
      )}
          {status === "error" ? (
            <div className="quote-form__error" role="alert">
              <strong>{message}</strong>
              <span><a href={emailHref}>Email the {mode === "cargo" ? "cargo" : "charter"} desk</a> with this request.</span>
            </div>
          ) : null}
    </form>
  );
}
