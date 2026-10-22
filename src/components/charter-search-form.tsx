"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Plus, Search, X } from "lucide-react";
import { AirportField } from "@/components/airport-field";
import { Button, Counter, Field, Input, Segmented } from "@/components/ui";
import { addDays, today } from "@/lib/format";
import { encodeItinerary, validateItinerary, type Itinerary, type TripType } from "@/lib/itinerary";
import type { Segment } from "@/lib/types";

const blank = (date = ""): Segment => ({ from: "", to: "", date, time: "09:00" });

export function CharterSearchForm({ initial, compact }: { initial?: Itinerary | null; compact?: boolean }) {
  const router = useRouter();
  const [trip, setTrip] = useState<TripType>(initial?.trip ?? "one-way");
  const [segments, setSegments] = useState<Segment[]>(
    initial?.segments.length ? initial.segments : [blank(), blank()]
  );
  const [pax, setPax] = useState(initial?.pax ?? 2);
  const [error, setError] = useState<string | null>(null);
  const day = today();

  // Round trips keep the return leg mirrored to the outbound route.
  const outbound = segments[0];
  const ret = segments[1] ?? blank();

  const setSeg = (i: number, patch: Partial<Segment>) =>
    setSegments((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const build = (): Segment[] => {
    if (trip === "one-way") return [outbound];
    if (trip === "round-trip") return [outbound, { ...ret, from: outbound.to, to: outbound.from }];
    return segments;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const it: Itinerary = { trip, segments: build(), pax };
    const err = validateItinerary(it, day);
    setError(err);
    if (!err) router.push(`/charter/?${encodeItinerary(it)}`);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Segmented
        value={trip}
        onChange={(t) => {
          setTrip(t);
          setError(null);
          if (t === "multi-city" && segments.length < 2) setSegments([outbound, blank()]);
        }}
        options={[
          { value: "one-way", label: "One way" },
          { value: "round-trip", label: "Round trip" },
          { value: "multi-city", label: "Multi-city" },
        ]}
      />

      {trip !== "multi-city" ? (
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
          <AirportField label="From" value={outbound.from} onChange={(c) => setSeg(0, { from: c })} />
          <button
            type="button"
            aria-label="Swap airports"
            onClick={() => setSeg(0, { from: outbound.to, to: outbound.from })}
            className="mx-auto -my-2 flex h-9 w-9 items-center justify-center self-end rounded-full border border-line bg-surface text-muted hover:text-ink md:mb-1.5 md:my-0"
          >
            <ArrowUpDown className="h-4 w-4 md:rotate-90" strokeWidth={1.8} />
          </button>
          <AirportField label="To" value={outbound.to} onChange={(c) => setSeg(0, { to: c })} />
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((s, i) => (
            <div key={i} className="rounded-2xl border border-line bg-canvas/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="eyebrow">Flight {i + 1}</span>
                {segments.length > 2 && (
                  <button
                    type="button"
                    aria-label={`Remove flight ${i + 1}`}
                    onClick={() => setSegments((prev) => prev.filter((_, j) => j !== i))}
                    className="rounded-full p-1 text-muted hover:bg-black/5 hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <AirportField label="From" value={s.from} onChange={(c) => setSeg(i, { from: c })} />
                <AirportField label="To" value={s.to} onChange={(c) => setSeg(i, { to: c })} />
                <Field label="Date">
                  <Input type="date" min={day} value={s.date} onChange={(e) => setSeg(i, { date: e.target.value })} className="h-12" />
                </Field>
                <Field label="Time">
                  <Input type="time" value={s.time} onChange={(e) => setSeg(i, { time: e.target.value })} className="h-12" />
                </Field>
              </div>
            </div>
          ))}
          {segments.length < 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSegments((prev) => {
                  const last = prev[prev.length - 1];
                  return [...prev, { ...blank(last.date ? addDays(last.date, 1) : ""), from: last.to }];
                })
              }
            >
              <Plus className="h-4 w-4" /> Add flight
            </Button>
          )}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-4"}`}>
        {trip !== "multi-city" && (
          <>
            <Field label="Depart">
              <Input type="date" min={day} value={outbound.date} onChange={(e) => setSeg(0, { date: e.target.value })} className="h-12" />
            </Field>
            <Field label="Time">
              <Input type="time" value={outbound.time} onChange={(e) => setSeg(0, { time: e.target.value })} className="h-12" />
            </Field>
          </>
        )}
        {trip === "round-trip" && (
          <>
            <Field label="Return">
              <Input
                type="date"
                min={outbound.date || day}
                value={ret.date}
                onChange={(e) => setSegments([outbound, { ...ret, date: e.target.value }])}
                className="h-12"
              />
            </Field>
            <Field label="Return time">
              <Input
                type="time"
                value={ret.time}
                onChange={(e) => setSegments([outbound, { ...ret, time: e.target.value }])}
                className="h-12"
              />
            </Field>
          </>
        )}
        <Field label="Passengers" group>
          <Counter value={pax} onChange={setPax} label="passengers" />
        </Field>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <Search className="h-4 w-4" strokeWidth={2} /> Get instant quotes
      </Button>
    </form>
  );
}
