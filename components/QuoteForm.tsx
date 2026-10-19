"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { localDate } from "@/lib/request";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { siteConfig } from "@/data/site";
import { FlightSearchPanel } from "./FlightSearchPanel";

type QuoteMode = "charter" | "cargo" | "group";
type Airport = { icao: string; iata?: string; name: string; city?: string; country?: string };

type QuoteFormProps = {
  mode?: QuoteMode;
  compact?: boolean;
};

type FormState = {
  departure: string;
  departureIcao: string;
  destination: string;
  destinationIcao: string;
  date: string;
  time: string;
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
    <input ref={input} id={id} value={value} maxLength={120} required autoComplete="off"
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
  if (mode !== "cargo") return <FlightSearchPanel compact={compact} group={mode === "group"} />;
  return <CargoRequestForm mode={mode} compact={compact} />;
}

function CargoRequestForm({ mode = "cargo", compact = false }: QuoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [stage, setStage] = useState<"mission" | "contact" | "success">("mission");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [form, setForm] = useState<FormState>({ ...initialState, passengers: mode === "group" ? "25" : "2" });
  const recipient = mode === "cargo" ? siteConfig.email.cargo : siteConfig.email.charter;
  const today = useMemo(() => localDate(), []);
  const passengerCount = Number(form.passengers);
  const groupHandled = mode === "charter" && Number.isFinite(passengerCount) && passengerCount > 18;

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (status === "loading") return;
    if (stage === "mission") {
      if (form.departure.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
        setStatus("error"); setMessage("Choose different origin and destination airports."); return;
      }
      const fields = new FormData(event.currentTarget);
      setForm(current => ({ ...current, date: String(fields.get("date") ?? current.date), cargoType: String(fields.get("cargoType") ?? current.cargoType), passengers: String(fields.get("passengers") ?? current.passengers) }));
      setStatus("idle");
      setStage("contact");
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus(), 0);
      return;
    }
    if (stage !== "contact") return;

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/requests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: groupHandled ? "group" : mode, ...form, source: window.location.pathname }),
        signal: AbortSignal.timeout(45_000),
      });
      const payload = (await response.json()) as { reference?: string; error?: string };
      if (!response.ok || !payload.reference) throw new Error(payload.error || "Your request could not be sent.");
      setReference(payload.reference);
      setStage("success");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Your request could not be sent.");
    }
  };

  const subject = mode === "cargo" ? "Cargo charter request" : mode === "group" ? "Group charter request" : "Private charter request";
  const fallbackBody = `${subject}\nFrom: ${form.departure}\nTo: ${form.destination}\nDate: ${form.date}\nCargo: ${form.cargoType}\nName: ${form.name}\nMobile: ${form.phone}\nEmail: ${form.email}\nNotes: ${form.notes}`;
  const notesLabel = mode === "cargo" ? "Shipment details" : mode === "group" ? "Group details" : "Anything else we should know?";
  const notesPlaceholder = mode === "cargo"
    ? "Dimensions, weight, handling requirements, timing, permits..."
    : mode === "group"
      ? "Return date, baggage, equipment, ground transport, schedule..."
      : "Return date, schedule flexibility, pets, baggage, ground coordination...";

  if (stage === "success") {
    return (
      <section className={`quote-form quote-form--${mode}${compact ? " quote-form--compact" : ""} quote-form--success`} aria-live="polite">
        <p className="quote-form__kicker">Request received</p>
        <CheckCircleIcon size={32} aria-hidden="true" /><h3 tabIndex={-1} ref={element => { element?.focus(); }}>An EXJET advisor is reviewing your mission.</h3>
        <p>We will contact you {siteConfig.responseWindow} using your preferred method. For an urgent departure, call <a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a>.</p>
        <div className="quote-form__reference"><span>Reference</span><strong>{reference}</strong></div>
        <button className="quote-form__new" type="button" onClick={() => { setForm({ ...initialState, passengers: mode === "group" ? "25" : "2" }); setReference(""); setStage("mission"); }}>
          Start another request <ArrowRightIcon size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <form ref={formRef} className={`quote-form quote-form--${mode}${compact ? " quote-form--compact" : ""} quote-form--${stage}`} onSubmit={submit} aria-busy={status === "loading"}>
      <p className="quote-form__progress">Step {stage === "mission" ? "1 of 2 · Shipment details" : "2 of 2 · Contact details"}</p>
      {stage === "mission" ? (
        <>
          <div className="quote-form__row">
            <AirportInput label={mode === "cargo" ? "Origin" : "Departure"} value={form.departure} code={form.departureIcao} onChange={(value, icao = "") => setForm((current) => ({ ...current, departure: value, departureIcao: icao }))} />
            <AirportInput label="Destination" value={form.destination} code={form.destinationIcao} onChange={(value, icao = "") => setForm((current) => ({ ...current, destination: value, destinationIcao: icao }))} />
            <label><span>Date</span><input value={form.date} onChange={(event) => update("date", event.target.value)} name="date" type="date" min={today} required /></label>
            {mode === "cargo" ? (
              <label><span>Cargo type</span><input value={form.cargoType} onChange={(event) => update("cargoType", event.target.value)} name="cargoType" maxLength={160} required placeholder="General description" /></label>
            ) : (
              <label><span>Passengers</span><input value={form.passengers} onChange={(event) => update("passengers", event.target.value)} name="passengers" type="number" inputMode="numeric" min="1" max="100" required /></label>
            )}
          </div>
          <div className="quote-form__submit">
            <button className="button button--dark" type="submit">
              Continue to contact details <ArrowRightIcon size={18} aria-hidden="true" />
            </button>
            <p>{groupHandled ? "This passenger count will be routed to EXJET group charter." : compact ? "One more step. No account required." : `An EXJET advisor will respond ${siteConfig.responseWindow}. Urgent request? Call ${siteConfig.phone.primary.display}.`}</p>
          </div>
        </>
      ) : (
        <>
          <div className="quote-form__mission-summary">
            <button type="button" disabled={status === "loading"} onClick={() => { setStatus("idle"); setMessage(""); setStage("mission"); }}><ArrowLeftIcon size={18} aria-hidden="true" /> Edit shipment</button>
            <p><strong>{form.departure}</strong><ArrowRightIcon size={18} aria-hidden="true" /><strong>{form.destination}</strong></p>
            <small>{form.date} · {mode === "cargo" ? form.cargoType : `${form.passengers} traveler${form.passengers === "1" ? "" : "s"}`}</small>
          </div>
          <div className="quote-form__row quote-form__row--identity">
            <label><span>Name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} name="name" minLength={2} maxLength={100} autoComplete="name" required placeholder="Your name" /></label>
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
              {status === "loading" ? "Sending securely..." : "Submit request"}<ArrowRightIcon size={18} aria-hidden="true" />
            </button>
            <p>By submitting, you agree that EXJET may contact you about this request. See our <Link href="/privacy">privacy policy</Link>.</p>
          </div>
        </>
      )}
          {status === "error" ? (
            <div className="quote-form__error" role="alert">
              <strong>{message}</strong>
              <span><a href={`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fallbackBody)}`}>Email {recipient}</a> or <a href={siteConfig.phone.primary.href}>call {siteConfig.phone.primary.display}</a>.</span>
            </div>
          ) : null}
    </form>
  );
}
