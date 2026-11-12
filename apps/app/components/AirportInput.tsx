"use client";

import { useEffect, useId, useState } from "react";
import { api, type Airport } from "@/lib/api";
import { useApi } from "@/hooks/use-api";

const cache = new Map<string, Airport>();
const remember = (list: Airport[]) => {
  list.forEach((a) => cache.set(a.icao, a));
  return list;
};

export function AirportInput({ id, label, value, onChange, flag }: { id: string; label: string; value: string; onChange: (icao: string) => void; flag?: boolean }) {
  const [query, setQuery] = useState<string | null>(null);
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(0);
  const lid = useId();

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced((query ?? "").trim()), 180);
    return () => window.clearTimeout(t);
  }, [query]);

  const search = debounced.length >= 2 && query !== null ? debounced : null;
  const results = useApi<Airport[]>(search ? `ap:${search}` : null, () => api.airports(search as string).then(remember));
  useApi<Airport[]>(value && !cache.has(value) ? `ap-known:${value}` : null, () => api.airports(value).then(remember));

  const known = value ? cache.get(value) : undefined;
  const shown = query ?? (value ? (known ? `${value} · ${known.name}` : value) : "");
  const list = results.data ?? [];
  const open = query !== null && debounced.length >= 2;

  function pick(a: Airport) {
    onChange(a.icao);
    setQuery(null);
  }
  function commitTyped() {
    const q = (query ?? "").trim();
    if (q && /^[A-Za-z0-9]{4}$/.test(q)) onChange(q.toUpperCase());
    else if (q && list.length === 1) onChange(list[0].icao);
    setQuery(null);
  }

  return (
    <div className={`field combo ${flag ? "flag" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls={lid}
        aria-autocomplete="list"
        aria-activedescendant={open && list[active] ? `${lid}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="City, airport name or code"
        value={shown}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onBlur={() => window.setTimeout(commitTyped, 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(list.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && open && list[active]) {
            e.preventDefault();
            pick(list[active]);
          } else if (e.key === "Escape") {
            setQuery(null);
          }
        }}
      />
      {flag ? <span className="flag-note">Needs your input</span> : null}
      {open ? (
        <ul className="combo-list" id={lid} role="listbox" aria-label={`${label} suggestions`} style={{ top: "auto", marginTop: 0 }}>
          {results.loading ? <li className="muted">Searching</li> : null}
          {!results.loading && list.length === 0 ? <li className="muted">No airports found</li> : null}
          {list.map((a, i) => (
            <li key={a.icao} id={`${lid}-${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); pick(a); }}>
              <span className="code">{a.icao}</span>
              <span>{a.name}<span className="muted small"> · {a.city}, {a.state}</span></span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Small suggestion chip used for intake `candidates` (airport disambiguation). */
export function AirportChip({ icao, onPick }: { icao: string; onPick: (icao: string) => void }) {
  useApi<Airport[]>(cache.has(icao) ? null : `ap-known:${icao}`, () => api.airports(icao).then(remember));
  const a = cache.get(icao);
  return (
    <button type="button" className="btn btn-sm" onClick={() => onPick(icao)}>
      <span className="mono">{icao}</span>
      {a ? <span className="muted small">{a.name}</span> : null}
    </button>
  );
}
