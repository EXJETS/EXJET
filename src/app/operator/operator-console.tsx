"use client";

import { useMemo, useState } from "react";
import { Plane, Plus, Trash2 } from "lucide-react";
import { AirportField } from "@/components/airport-field";
import { Gate } from "@/components/gate";
import { RouteLine } from "@/components/route";
import { Stat } from "@/components/stat";
import { Button, Card, EmptyState, Field, Input, PageHeader, Segmented, Select, StatusBadge } from "@/components/ui";
import { AIRCRAFT_TYPES, CATEGORY_LABELS, getAircraftType } from "@/lib/data/aircraft";
import { airportLabel } from "@/lib/data/airports";
import { quoteCharter } from "@/lib/flight";
import { addDays, money, plural, shortDate, today } from "@/lib/format";
import { departureTime } from "@/lib/legs";
import type { Booking, User } from "@/lib/types";
import { useApp } from "@/store/app-store";

type Tab = "requests" | "legs" | "fleet";

export function OperatorConsole() {
  return (
    <Gate role="operator" next="/operator/">
      {(user) => <Console user={user} />}
    </Gate>
  );
}

function Console({ user }: { user: User }) {
  const opId = user.operatorId!;
  const operator = useApp((s) => s.operators.find((o) => o.id === opId));
  const fleet = useApp((s) => s.fleet).filter((f) => f.operatorId === opId);
  const legs = useApp((s) => s.emptyLegs).filter((l) => l.operatorId === opId);
  const bookings = useApp((s) => s.bookings);
  const [tab, setTab] = useState<Tab>("requests");

  const myTypes = new Set(fleet.map((f) => f.typeId));
  const open = bookings.filter(
    (b) => b.status === "requested" && (b.operatorId === opId || (!b.operatorId && myTypes.has(b.typeId)))
  );
  const confirmed = bookings.filter((b) => b.operatorId === opId && b.status === "confirmed");
  const revenue = bookings
    .filter((b) => b.operatorId === opId && (b.status === "confirmed" || b.status === "completed"))
    .reduce((s, b) => s + b.quote.total, 0);
  const liveLegs = legs.filter((l) => l.status === "available" && departureTime(l) > Date.now());

  return (
    <>
      <PageHeader
        eyebrow="Operator console"
        title={operator?.name ?? "Operator"}
        description={operator ? `${operator.safetyRating} · based at ${airportLabel(operator.base)}` : undefined}
      />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open requests" value={String(open.length)} />
        <Stat label="Confirmed trips" value={String(confirmed.length)} />
        <Stat label="Live empty legs" value={String(liveLegs.length)} />
        <Stat label="Booked revenue" value={money(revenue)} />
      </div>

      <Segmented
        className="mt-8"
        value={tab}
        onChange={setTab}
        options={[
          { value: "requests", label: "Trips" },
          { value: "legs", label: "Empty legs" },
          { value: "fleet", label: "Fleet" },
        ]}
      />

      <div className="mt-5">
        {tab === "requests" && <Requests opId={opId} open={open} confirmed={confirmed} />}
        {tab === "legs" && <Legs opId={opId} />}
        {tab === "fleet" && <Fleet opId={opId} base={operator?.base ?? ""} />}
      </div>
    </>
  );
}

function BookingRow({ b, children }: { b: Booking; children: React.ReactNode }) {
  const first = b.segments[0];
  const last = b.segments[b.segments.length - 1];
  return (
    <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
      <div className="md:w-72">
        <RouteLine from={first.from} to={b.segments.length === 2 && first.from === last.to ? first.to : last.to} />
      </div>
      <div className="flex-1 text-[13px] text-ink-2">
        <p className="font-mono text-muted">
          {b.ref} · {b.kind === "empty-leg" ? "Empty leg" : "Charter"}
        </p>
        <p className="mt-1">
          {shortDate(first.date)} {first.time}
          {b.segments.length > 1 ? ` · ${plural(b.segments.length, "flight")}` : ""} · {getAircraftType(b.typeId)?.name} ·{" "}
          {plural(b.pax, "guest")}
        </p>
        <p className="mt-1 text-muted">
          {b.contact.name} · {b.contact.phone}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
        <p className="text-[17px] font-semibold">{money(b.quote.total)}</p>
        <div className="flex gap-2">{children}</div>
      </div>
    </Card>
  );
}

function Requests({ opId, open, confirmed }: { opId: string; open: Booking[]; confirmed: Booking[] }) {
  const accept = useApp((s) => s.acceptBooking);
  const setStatus = useApp((s) => s.setBookingStatus);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-[17px] font-semibold">Awaiting your confirmation</h2>
        {open.length === 0 ? (
          <EmptyState title="You're all caught up" body="New charter requests that match your fleet appear here." />
        ) : (
          <div className="grid gap-3">
            {open.map((b) => (
              <BookingRow key={b.id} b={b}>
                {b.operatorId === opId && (
                  <Button size="sm" variant="ghost" className="text-danger" onClick={() => setStatus(b.id, "cancelled")}>
                    Decline
                  </Button>
                )}
                <Button size="sm" onClick={() => accept(b.id, opId)}>
                  {b.operatorId ? "Confirm" : "Accept trip"}
                </Button>
              </BookingRow>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-[17px] font-semibold">Confirmed</h2>
        {confirmed.length === 0 ? (
          <p className="text-[14px] text-muted">No confirmed trips.</p>
        ) : (
          <div className="grid gap-3">
            {confirmed.map((b) => (
              <BookingRow key={b.id} b={b}>
                <Button size="sm" variant="secondary" onClick={() => setStatus(b.id, "completed")}>
                  Mark flown
                </Button>
              </BookingRow>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Legs({ opId }: { opId: string }) {
  const all = useApp((s) => s.emptyLegs);
  const legs = useMemo(
    () => all.filter((l) => l.operatorId === opId).sort((a, b) => departureTime(a) - departureTime(b)),
    [all, opId]
  );
  const fleet = useApp((s) => s.fleet);
  const setLegStatus = useApp((s) => s.setEmptyLegStatus);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {adding ? (
        <NewLegForm opId={opId} onDone={() => setAdding(false)} />
      ) : (
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Post empty leg
        </Button>
      )}
      {legs.length === 0 ? (
        <EmptyState title="No empty legs posted" body="Post a repositioning flight and it goes live to every EXJET guest instantly." />
      ) : (
        <div className="grid gap-3">
          {legs.map((l) => {
            const f = fleet.find((x) => x.id === l.fleetId);
            const past = departureTime(l) <= Date.now();
            return (
              <Card key={l.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="md:w-72">
                  <RouteLine from={l.from} to={l.to} />
                </div>
                <div className="flex-1 text-[13px] text-ink-2">
                  <p>
                    {shortDate(l.date)} · {l.time}
                    {l.flexHours ? ` ±${l.flexHours}h` : ""}
                  </p>
                  <p className="text-muted">
                    {f ? `${f.tail} · ${getAircraftType(f.typeId)?.name}` : "Aircraft removed"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <p className="text-[17px] font-semibold">{money(l.price)}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={past && l.status === "available" ? "completed" : l.status} />
                    {l.status === "available" && !past && (
                      <Button size="sm" variant="ghost" onClick={() => setLegStatus(l.id, "withdrawn")}>
                        Withdraw
                      </Button>
                    )}
                    {l.status === "withdrawn" && !past && (
                      <Button size="sm" variant="ghost" onClick={() => setLegStatus(l.id, "available")}>
                        Relist
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewLegForm({ opId, onDone }: { opId: string; onDone: () => void }) {
  const fleet = useApp((s) => s.fleet).filter((f) => f.operatorId === opId);
  const addEmptyLeg = useApp((s) => s.addEmptyLeg);
  const day = today();
  const [form, setForm] = useState({
    fleetId: fleet[0]?.id ?? "",
    from: fleet[0]?.base ?? "",
    to: "",
    date: addDays(day, 1),
    time: "10:00",
    flexHours: 2,
    price: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const typeId = fleet.find((f) => f.id === form.fleetId)?.typeId ?? "";
  const retail =
    form.from && form.to && form.from !== form.to
      ? quoteCharter(typeId, [{ from: form.from, to: form.to, date: form.date, time: form.time }], 1)?.total
      : undefined;

  if (fleet.length === 0) {
    return <EmptyState title="Add an aircraft first" body="Empty legs are posted against a tail in your fleet." />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || !form.to) return setError("Choose both airports.");
    if (form.from === form.to) return setError("Departure and arrival must differ.");
    if (form.date < day) return setError("Date must be today or later.");
    if (!retail) return setError("This aircraft can't fly that route without too many fuel stops.");
    if (form.price <= 0) return setError("Set a price.");
    addEmptyLeg({ ...form, operatorId: opId });
    onDone();
  };

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-[17px] font-semibold">Post an empty leg</h2>
        <Field label="Aircraft">
          <Select
            value={form.fleetId}
            onChange={(e) => {
              const f = fleet.find((x) => x.id === e.target.value);
              setForm({ ...form, fleetId: e.target.value, from: form.from || f?.base || "" });
            }}
          >
            {fleet.map((f) => (
              <option key={f.id} value={f.id}>
                {f.tail} · {getAircraftType(f.typeId)?.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <AirportField label="From" value={form.from} onChange={(from) => setForm({ ...form, from })} />
          <AirportField label="To" value={form.to} onChange={(to) => setForm({ ...form, to })} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Date">
            <Input type="date" min={day} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Departure (local)">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Flexibility">
            <Select value={form.flexHours} onChange={(e) => setForm({ ...form, flexHours: Number(e.target.value) })}>
              {[0, 1, 2, 3, 4, 6].map((h) => (
                <option key={h} value={h}>
                  {h ? `±${h} hours` : "Fixed time"}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Price (USD, all-in)"
            hint={retail ? `Charter rate ≈ ${money(retail)}${form.price ? ` · ${Math.max(0, Math.round((1 - form.price / retail) * 100))}% off` : ""}` : undefined}
          >
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={form.price || ""}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Field>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit">Publish</Button>
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Fleet({ opId, base }: { opId: string; base: string }) {
  const fleet = useApp((s) => s.fleet).filter((f) => f.operatorId === opId);
  const legs = useApp((s) => s.emptyLegs);
  const addFleet = useApp((s) => s.addFleet);
  const removeFleet = useApp((s) => s.removeFleet);
  const [form, setForm] = useState({ tail: "", typeId: AIRCRAFT_TYPES[0].id, base, yearOfManufacture: 2020 });
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fleet.map((f) => {
          const t = getAircraftType(f.typeId);
          const inUse = legs.some((l) => l.fleetId === f.id && l.status !== "withdrawn" && departureTime(l) > Date.now());
          return (
            <Card key={f.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[15px] font-semibold">{f.tail}</p>
                  <p className="text-[14px]">{t?.name}</p>
                  <p className="text-[12px] text-muted">
                    {t && CATEGORY_LABELS[t.category]} · {t?.seats} seats · {f.yearOfManufacture}
                  </p>
                  <p className="mt-2 text-[12px] text-muted">Based at {airportLabel(f.base)}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${f.tail}`}
                  disabled={inUse}
                  title={inUse ? "Has live empty legs" : undefined}
                  onClick={() => removeFleet(f.id)}
                  className="rounded-full p-2 text-subtle hover:bg-black/5 hover:text-ink disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const tail = form.tail.trim().toUpperCase();
            if (!/^[A-Z0-9-]{3,8}$/.test(tail)) return setError("Enter a valid registration, e.g. N123AB.");
            if (!form.base) return setError("Choose a home base.");
            addFleet({ ...form, tail, operatorId: opId });
            setForm({ ...form, tail: "" });
            setError(null);
          }}
          className="space-y-4"
        >
          <h2 className="flex items-center gap-2 text-[17px] font-semibold">
            <Plane className="h-4 w-4" /> Add aircraft
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Registration">
              <Input value={form.tail} onChange={(e) => setForm({ ...form, tail: e.target.value })} placeholder="N123AB" autoCapitalize="characters" />
            </Field>
            <Field label="Type">
              <Select value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })}>
                {AIRCRAFT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Year">
              <Input
                type="number"
                inputMode="numeric"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={form.yearOfManufacture}
                onChange={(e) => setForm({ ...form, yearOfManufacture: Number(e.target.value) })}
              />
            </Field>
            <AirportField label="Home base" value={form.base} onChange={(b) => setForm({ ...form, base: b })} />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
          <Button type="submit">Add to fleet</Button>
        </form>
      </Card>
      <p className="text-[13px] text-muted">Charter requests for any aircraft type in your fleet appear under Trips.</p>
    </div>
  );
}
