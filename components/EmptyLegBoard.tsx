"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useEffect, useState } from "react";
import { localDate } from "@/lib/request";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import type { EmptyLeg } from "@/data/emptyLegs";
import { siteConfig } from "@/data/site";

type SearchStatus = "idle" | "searching" | "complete" | "error";
type RequestStatus = "idle" | "sending" | "success" | "error";

export function EmptyLegBoard({ items, live = false }: { items: EmptyLeg[]; live?: boolean }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [results, setResults] = useState(items);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [searchMessage, setSearchMessage] = useState("");
  const [selected, setSelected] = useState<EmptyLeg | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestMessage, setRequestMessage] = useState("");
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const today = useMemo(() => localDate(), []);
  const isLive = searchStatus === "complete" || (live && searchStatus === "idle");
  const inquiry = useRef<HTMLElement>(null);
  useEffect(() => { if (selected) inquiry.current?.querySelector<HTMLInputElement>("input")?.focus(); }, [selected]);

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchStatus === "searching") return;
    if (!origin.trim() && !destination.trim()) {
      setSelected(null); setResults([]); setSearchStatus("error"); setSearchMessage("Enter an origin or destination airport to begin."); return;
    }
    setSelected(null);
    setResults([]);
    setSearchStatus("searching");
    setSearchMessage("");
    try {
      const response = await fetch("/api/empty-legs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departure: origin, destination, date, passengers: Number(passengers), flexibilityDays: 3 }),
        signal: AbortSignal.timeout(30_000),
      });
      const payload = await response.json() as { items?: EmptyLeg[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Availability could not be reached.");
      setResults(payload.items ?? []);
      setSearchStatus("complete");
    } catch (error) {
      setResults([]);
      setSearchStatus("error");
      setSearchMessage(error instanceof Error ? error.message : "Availability could not be reached.");
    }
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || requestStatus === "sending") return;
    setRequestStatus("sending");
    setRequestMessage("");
    try {
      const response = await fetch("/api/empty-legs/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId: selected.searchId, emptyLegId: selected.id, ...contact }),
        signal: AbortSignal.timeout(30_000),
      });
      const payload = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !payload.reference) throw new Error(payload.error || "This request could not be sent.");
      setReference(payload.reference);
      setRequestStatus("success");
    } catch (error) {
      setRequestStatus("error");
      setRequestMessage(error instanceof Error ? error.message : "This request could not be sent.");
    }
  };

  return (
    <div className="empty-leg-board">
      <div className="empty-leg-board__status">
        <span className={isLive ? "is-live" : ""}>{isLive ? "Live" : "On request"}</span>
        <p>Empty-leg availability changes continuously and is always reconfirmed before booking</p>
        <strong>{searchStatus === "searching" ? "Searching" : results.length ? `${results.length} opportunities` : "Dynamic availability"}</strong>
      </div>
      <form aria-busy={searchStatus === "searching"} className="empty-leg-search" onSubmit={submitSearch}>
        <label><span>From</span><input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="City, IATA or ICAO" /></label>
        <label><span>To</span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="City, IATA or ICAO" /></label>
        <label><span>Date</span><input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label><span>Passengers</span><input type="number" min="1" max="100" value={passengers} onChange={(event) => setPassengers(event.target.value)} required /></label>
        <button type="submit" disabled={searchStatus === "searching"}>{searchStatus === "searching" ? "Searching..." : "Search availability"}<ArrowRightIcon size={18} aria-hidden="true" /></button>
      </form>
      <div className="empty-leg-results" aria-live="polite">
        {results.length ? results.map((item) => (
          <article key={item.id}>
            <div><span>{item.departureAirport}</span><small>{item.departureCity}</small></div>
            <ArrowRightIcon size={20} aria-hidden="true" />
            <div><span>{item.arrivalAirport}</span><small>{item.arrivalCity}</small></div>
            <div><span>{item.departureDate}</span><small>{item.departureWindow ?? "Time on request"}</small></div>
            <div><span>{item.aircraftModel ?? item.aircraftCategory}</span><small>{item.seats ? `Up to ${item.seats} seats` : item.aircraftCategory}</small></div>
            <button className="empty-leg-results__request" type="button" onClick={() => { setSelected(item); setRequestStatus("idle"); setRequestMessage(""); setReference(""); }}>Request this leg</button>
          </article>
        )) : (
          <div className="empty-leg-results__empty">
            <span>{searchStatus === "error" ? "Search unavailable" : searchStatus === "complete" ? "No current match" : "Dynamic inventory"}</span>
            <h2>{searchStatus === "complete" ? "No published match right now." : "Tell us where you want to go."}</h2>
            <p>{searchMessage || (searchStatus === "complete" ? "Empty legs change quickly. Adjust your route or date, or ask EXJET to watch for a suitable repositioning opportunity." : "Search by route and date, or ask EXJET to watch for an opportunity that fits your timing and passenger count.")}</p>
            <Link className="button" href="/contact?service=empty-leg"><span>Request an empty-leg match</span><ArrowRightIcon size={18} aria-hidden="true" /></Link>
          </div>
        )}
      </div>
      {selected ? (
        <section ref={inquiry} className="empty-leg-inquiry" aria-live="polite">
          {requestStatus === "success" ? (
            <div className="empty-leg-inquiry__success">
              <span>Request received</span>
              <h3 tabIndex={-1} ref={element => { element?.focus(); }}>An EXJET advisor is reviewing this opportunity.</h3>
              <p>We will contact you {siteConfig.responseWindow}. Reference <strong>{reference}</strong>.</p>
            </div>
          ) : (
            <form aria-busy={requestStatus === "sending"} onSubmit={submitRequest}>
              <header>
                <div><span>Selected opportunity</span><h3>{selected.departureAirport} → {selected.arrivalAirport}</h3><p>{selected.departureDate} · {selected.aircraftModel ?? selected.aircraftCategory}</p></div>
                <button type="button" onClick={() => setSelected(null)} disabled={requestStatus === "sending"} aria-label="Close request form"><XIcon size={20} aria-hidden="true" /></button>
              </header>
              <div className="empty-leg-inquiry__fields">
                <label><span>Name</span><input value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} autoComplete="name" minLength={2} maxLength={100} required /></label>
                <label><span>Mobile</span><input value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} type="tel" autoComplete="tel" maxLength={40} required /></label>
                <label><span>Email</span><input value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} type="email" autoComplete="email" maxLength={180} required /></label>
              </div>
              <label className="empty-leg-inquiry__notes"><span>Notes</span><textarea value={contact.notes} onChange={(event) => setContact((current) => ({ ...current, notes: event.target.value }))} maxLength={2500} rows={3} placeholder="Schedule flexibility, baggage, pets, return needs..." /></label>
              <p>EXJET arranges charter as a broker. Availability and pricing require confirmation. By submitting, you agree that EXJET may contact you about this request. Read our <Link href="/privacy">privacy policy</Link>.</p>
              <button className="button button--dark" type="submit" disabled={requestStatus === "sending"}><span>{requestStatus === "sending" ? "Sending securely..." : "Send request"}</span><ArrowRightIcon size={18} aria-hidden="true" /></button>
              {requestStatus === "error" ? <strong role="alert">{requestMessage}</strong> : null}
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
}
