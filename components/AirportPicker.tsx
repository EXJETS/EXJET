"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BrowseFlightGlyph as Icon } from "./BrowseFlightGlyph";
import styles from "./AirportPicker.module.css";

type Airport = { icao: string; iata?: string; name: string; city?: string; country?: string };
type Lookup = { query: string; items: Airport[]; failed: boolean };

export function AirportPicker({ label, title, value, code, onChange }: {
  label: string; title?: string; value: string; code: string;
  onChange: (value: string, code?: string) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const advance = useRef(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const query = draft.trim();
  const result = lookup?.query === query ? lookup : null;

  useEffect(() => {
    if (!open || query.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const timeout = window.setTimeout(() => {
        if (controller.signal.aborted) return;
        setLookup({ query, items: [], failed: true });
        controller.abort();
      }, 6000);
      try {
        const response = await fetch(`/api/airports/?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Airport lookup unavailable");
        const payload = await response.json() as { items?: Airport[] };
        if (!controller.signal.aborted) setLookup({ query, items: payload.items ?? [], failed: false });
      } catch {
        if (!controller.signal.aborted) setLookup({ query, items: [], failed: true });
      } finally {
        window.clearTimeout(timeout);
      }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, query]);

  useEffect(() => {
    const modal = dialog.current;
    const viewport = window.visualViewport;
    if (!open || !modal || !viewport) return;
    const fit = () => { modal.style.setProperty("--airport-picker-h", `${viewport.height}px`); };
    fit();
    viewport.addEventListener("resize", fit);
    return () => {
      viewport.removeEventListener("resize", fit);
      modal.style.removeProperty("--airport-picker-h");
    };
  }, [open]);

  function show() {
    if (!dialog.current || dialog.current.open) return;
    advance.current = false;
    setDraft(code || value);
    setLookup(null);
    setOpen(true);
    dialog.current.showModal();
    input.current?.focus();
    requestAnimationFrame(() => { if (dialog.current?.open) input.current?.select(); });
  }
  function select(value: string, code?: string) {
    onChange(value, code);
    advance.current = true;
    dialog.current?.close();
  }
  function onClose() {
    setOpen(false);
    const button = trigger.current;
    if (!button) return;
    if (advance.current) {
      const controls = Array.from(button.form?.querySelectorAll<HTMLElement>("[data-airport-trigger], input[type=date]:not([disabled])") ?? []);
      const next = controls[controls.indexOf(button) + 1];
      if (next) { next.focus(); return; }
    }
    button.focus();
  }

  const heading = title ?? (label === "From" ? "Departure airport" : label === "To" ? "Arrival airport" : label);
  const status = query.length < 2 ? "Enter at least two characters to find an airport." : !result ? "Searching airports…" : result.failed ? "Airport lookup is unavailable right now." : result.items.length ? `${result.items.length} airport${result.items.length === 1 ? "" : "s"} found.` : "No matching airports.";

  return <div className={`quote-form__airport ${styles.field}`}>
    <span id={`${id}-label`} className={styles.label}>{label}</span>
    <button className={styles.trigger} ref={trigger} type="button" data-airport-trigger aria-haspopup="dialog" aria-expanded={open} aria-controls={id} aria-labelledby={`${id}-label ${id}-value`} onClick={show}>
      <Icon name="pin" width={17} height={17}/><span id={`${id}-value`} className={value ? styles.chosen : styles.placeholder}>{value || "City or airport"}</span>
    </button>
    <dialog id={id} className={styles.dialog} ref={dialog} aria-labelledby={`${id}-title`} onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); dialog.current?.close(); }
      }}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div><p>Choose your airport</p><h2 id={`${id}-title`}>{heading}</h2></div>
          <button className={styles.close} type="button" aria-label="Close airport search" onClick={() => dialog.current?.close()}><Icon name="close"/></button>
        </header>
        <label className={styles.searchLabel} htmlFor={`${id}-search`}>Search airports</label>
        <div className={styles.search}>
          <Icon name="search"/>
          <input ref={input} id={`${id}-search`} type="search" value={draft} maxLength={100}
            placeholder="City, airport name, or code" autoComplete="off" autoCorrect="off" spellCheck={false}
            onChange={event => { setDraft(event.target.value); setLookup(null); }}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === "ArrowDown") {
                const first = dialog.current?.querySelector<HTMLButtonElement>("[data-airport-result]");
                if (event.key === "Enter" || first) { event.preventDefault(); first?.focus(); }
              }
            }}/>
        </div>
        <div className={styles.results}>
          <p className={styles.status} role="status">{status}</p>
          {result?.items.length ? <ul className={styles.list} aria-label="Matching airports">
            {result.items.map((airport,index) => {
              const title = [airport.city, airport.name].filter(Boolean).join(" · ");
              const codes = [airport.iata, airport.icao].filter(Boolean).join(" / ");
              return <li key={airport.icao}><button type="button" className={styles.result} data-airport-result
                onClick={() => select(`${title} (${codes})`.slice(0, 120), airport.icao)}
                onKeyDown={event => {
                  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    event.preventDefault();
                    if (event.key === "ArrowUp" && index === 0) input.current?.focus();
                    else {
                      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>("[data-airport-result]");
                      buttons?.[index + (event.key === "ArrowUp" ? -1 : 1)]?.focus();
                    }
                  }
                }}>
                <Icon name="pin" width={18} height={18}/><span><strong>{title}</strong>{airport.country && <small>{airport.country}</small>}</span><b>{codes}</b>
              </button></li>;
            })}
          </ul> : null}
          {result && !result.items.length && query.length >= 2 ? <button className={styles.manual} type="button" onClick={() => select(query)}>
            Use “{query}” without an airport match <small>An online estimate may not be available.</small>
          </button> : null}
        </div>
      </div>
    </dialog>
  </div>;
}
