"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { getAirport, searchAirports } from "@/lib/data/airports";
import { cn } from "@/lib/format";

/** Airport combobox. `value` is an ICAO code ("" when empty). */
export function AirportField({
  label,
  value,
  onChange,
  placeholder = "City or airport",
  className,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const selected = value ? getAirport(value) : undefined;
  const display = selected ? `${selected.city} (${selected.iata ?? selected.code})` : "";
  const [text, setText] = useState(display);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setText(display), [display]);

  const results = open ? searchAirports(text === display ? "" : text) : [];

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" strokeWidth={1.8} />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={`${id}-list`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={text}
          placeholder={placeholder}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              setText(display);
            }, 120);
          }}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
            setOpen(true);
            if (!e.target.value) onChange("");
          }}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              pick(results[active].code);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-12 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-ink outline-none transition placeholder:text-subtle focus:border-ink focus:ring-4 focus:ring-black/5"
        />
      </div>
      {results.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 z-30 mt-1.5 max-h-72 overflow-auto rounded-xl border border-line bg-surface py-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]"
        >
          {results.map((a, i) => (
            <li key={a.code} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(a.code)}
                onMouseEnter={() => setActive(i)}
                className={cn("flex w-full items-center gap-3 px-3.5 py-2.5 text-left", i === active && "bg-canvas")}
              >
                <span className="w-11 shrink-0 font-mono text-[13px] font-semibold">{a.iata ?? a.code}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px]">{a.city}</span>
                  <span className="block truncate text-[12px] text-muted">
                    {a.name} · {a.code}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
