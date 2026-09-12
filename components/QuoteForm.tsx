"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
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

function AirportInput({
  label,
  value,
  code,
  onChange,
}: {
  label: string;
  value: string;
  code: string;
  onChange: (value: string, icao?: string) => void;
}) {
  const listId = useId();
  const [items, setItems] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value.trim().length < 2 || code) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/airports/?q=${encodeURIComponent(value.trim())}`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { items?: Airport[] };
        setItems(payload.items ?? []);
        setOpen(Boolean(payload.items?.length));
      } catch {
        // A plain-text airport remains valid when the live lookup is unavailable.
      }
    }, 280);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [code, value]);

  return (
    <label className="quote-form__airport">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => {
          setItems([]);
          setOpen(false);
          onChange(event.target.value);
        }}
        onFocus={() => setOpen(Boolean(items.length))}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder="City, airport, IATA or ICAO"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        required
      />
      {code ? <small>{code} selected</small> : null}
      {open ? (
        <div className="quote-form__airport-list" id={listId} role="listbox">
          {items.map((airport) => {
            const title = [airport.city, airport.name].filter(Boolean).join(" · ");
            const codes = [airport.iata, airport.icao].filter(Boolean).join(" / ");
            return (
              <button
                key={airport.icao}
                type="button"
                role="option"
                aria-selected="false"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(`${title} (${codes})`, airport.icao);
                  setOpen(false);
                }}
              >
                <strong>{title}</strong><small>{codes}{airport.country ? ` · ${airport.country}` : ""}</small>
              </button>
            );
          })}
        </div>
      ) : null}
    </label>
  );
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
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const passengerCount = Number(form.passengers);
  const groupHandled = mode === "charter" && Number.isFinite(passengerCount) && passengerCount > 18;

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (stage === "mission") {
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
  const fallbackBody = `${subject}\nFrom: ${form.departure}\nTo: ${form.destination}\nDate: ${form.date}\nName: ${form.name}\nMobile: ${form.phone}\nEmail: ${form.email}\nNotes: ${form.notes}`;
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
        <h3>An EXJET advisor is reviewing your mission.</h3>
        <p>We will contact you {siteConfig.responseWindow} using your preferred method. For an urgent departure, call <a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a>.</p>
        <div className="quote-form__reference"><span>Reference</span><strong>{reference}</strong></div>
        <button className="quote-form__new" type="button" onClick={() => { setForm({ ...initialState, passengers: mode === "group" ? "25" : "2" }); setReference(""); setStage("mission"); }}>
          Start another request <span aria-hidden="true">→</span>
        </button>
      </section>
    );
  }

  return (
    <form ref={formRef} className={`quote-form quote-form--${mode}${compact ? " quote-form--compact" : ""} quote-form--${stage}`} onSubmit={submit} aria-busy={status === "loading"}>
      {stage === "mission" ? (
        <>
          <div className="quote-form__row">
            <AirportInput label={mode === "cargo" ? "Origin" : "Departure"} value={form.departure} code={form.departureIcao} onChange={(value, icao = "") => setForm((current) => ({ ...current, departure: value, departureIcao: icao }))} />
            <AirportInput label="Destination" value={form.destination} code={form.destinationIcao} onChange={(value, icao = "") => setForm((current) => ({ ...current, destination: value, destinationIcao: icao }))} />
            <label><span>Date</span><input value={form.date} onChange={(event) => update("date", event.target.value)} name="date" type="date" min={today} required /></label>
            {mode === "cargo" ? (
              <label><span>Cargo type</span><input value={form.cargoType} onChange={(event) => update("cargoType", event.target.value)} name="cargoType" required placeholder="General description" /></label>
            ) : (
              <label><span>Passengers</span><input value={form.passengers} onChange={(event) => update("passengers", event.target.value)} name="passengers" type="number" inputMode="numeric" min="1" max="100" required /></label>
            )}
          </div>
          <div className="quote-form__submit">
            <button className="button button--dark" type="submit">
              Continue <span aria-hidden="true">→</span>
            </button>
            <p>{groupHandled ? "This passenger count will be routed to EXJET group charter." : compact ? "One more step. No account required." : `An EXJET advisor will respond ${siteConfig.responseWindow}. Urgent request? Call ${siteConfig.phone.primary.display}.`}</p>
          </div>
        </>
      ) : (
        <>
          <div className="quote-form__mission-summary">
            <button type="button" onClick={() => { setStatus("idle"); setStage("mission"); }}>← Edit trip</button>
            <p><strong>{form.departure}</strong><span aria-hidden="true">→</span><strong>{form.destination}</strong></p>
            <small>{form.date} · {mode === "cargo" ? form.cargoType : `${form.passengers} traveler${form.passengers === "1" ? "" : "s"}`}</small>
          </div>
          <div className="quote-form__row quote-form__row--identity">
            <label><span>Name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} name="name" autoComplete="name" required placeholder="Your name" /></label>
            <label><span>Mobile</span><input value={form.phone} onChange={(event) => update("phone", event.target.value)} name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+1" /></label>
            <label><span>Email</span><input value={form.email} onChange={(event) => update("email", event.target.value)} name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@company.com" /></label>
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
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} name="notes" rows={compact ? 2 : 4} placeholder={notesPlaceholder} />
          </label>
          <label className="quote-form__honeypot" aria-hidden="true"><span>Website</span><input value={form.website} onChange={(event) => update("website", event.target.value)} name="website" tabIndex={-1} autoComplete="off" /></label>
          <p className="quote-form__broker-disclosure">EXJET arranges charter as a broker. The identified licensed third-party air carrier operates the flight and retains operational control.</p>
          <div className="quote-form__submit quote-form__submit--contact">
            <button className="button button--dark" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending securely..." : "Submit request"}<span aria-hidden="true">→</span>
            </button>
            <p>By submitting, you agree that EXJET may contact you about this request. See our <Link href="/privacy">privacy policy</Link>.</p>
          </div>
          {status === "error" ? (
            <div className="quote-form__error" role="alert">
              <strong>{message}</strong>
              <span><a href={`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fallbackBody)}`}>Email {recipient}</a> or <a href={siteConfig.phone.primary.href}>call {siteConfig.phone.primary.display}</a>.</span>
            </div>
          ) : null}
        </>
      )}
    </form>
  );
}
