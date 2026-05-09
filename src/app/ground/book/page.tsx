"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Car,
  CreditCard,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleCard } from "@/components/ground/vehicle-card";
import { useGroundStore } from "@/stores/ground-store";
import vehicles from "@/data/vehicles.json";
import type { Vehicle, TripType } from "@/types";

const STEPS = [
  { number: 1, label: "Route" },
  { number: 2, label: "Vehicle" },
  { number: 3, label: "Details" },
  { number: 4, label: "Review" },
  { number: 5, label: "Confirm" },
];

const TRIP_TYPES: { key: TripType; label: string; desc: string }[] = [
  { key: "airport_transfer", label: "Airport Transfer", desc: "To or from any airport" },
  { key: "point_to_point", label: "Point to Point", desc: "Any address to another" },
  { key: "hourly", label: "Hourly Hire", desc: "Book by the hour" },
  { key: "full_day", label: "Full Day", desc: "8+ hour disposals" },
];

function BookPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useGroundStore();
  const { draft } = store;

  const [confirmed, setConfirmed] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  useEffect(() => {
    const from = params.get("from");
    const to = params.get("to");
    const type = params.get("type") as TripType | null;
    if (from) store.setPickup({ address: from });
    if (to) store.setDropoff({ address: to });
    if (type) store.setTripType(type);
  }, []);

  function estimatePrice(vehicle: Vehicle) {
    const dist = draft.estimatedDistance || 15;
    if (draft.tripType === "hourly") return vehicle.basePrice * draft.hours;
    if (draft.tripType === "full_day") return vehicle.basePrice * 8;
    return Math.round(vehicle.basePrice + vehicle.pricePerMile * dist);
  }

  function handleConfirm() {
    const record = store.confirmBooking();
    setConfirmCode(record.confirmationCode);
    setConfirmed(true);
  }

  if (confirmed) {
    return <ConfirmationScreen code={confirmCode} draft={draft} onViewTracking={() => router.push("/ground/tracking")} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        {draft.step > 1 && (
          <button
            type="button"
            onClick={store.prevStep}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
            EXJET Ground
          </div>
          <h1 className="font-serif text-[28px] text-[var(--color-ink)]">Book a Chauffeur</h1>
        </div>
      </div>

      {/* Step indicators */}
      <div className="mb-10 flex items-center gap-0">
        {STEPS.map((step, idx) => (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-mono text-[12px] transition-all",
                  draft.step === step.number
                    ? "bg-champagne text-white"
                    : draft.step > step.number
                    ? "border-2 border-champagne bg-transparent text-champagne"
                    : "border border-[var(--color-hairline)] bg-white text-[var(--color-subtle)]"
                )}
              >
                {draft.step > step.number ? <CheckCircle className="h-4 w-4" strokeWidth={2.5} /> : step.number}
              </div>
              <span className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", draft.step === step.number ? "text-[var(--color-ink)]" : "text-[var(--color-subtle)]")}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn("mx-1 h-px flex-1 transition-colors", draft.step > step.number ? "bg-champagne/40" : "bg-[var(--color-hairline)]")} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {draft.step === 1 && <Step1Route />}
      {draft.step === 2 && <Step2Vehicle estimatePrice={estimatePrice} />}
      {draft.step === 3 && <Step3Details />}
      {draft.step === 4 && <Step4Review estimatePrice={estimatePrice} />}
      {draft.step === 5 && <Step5Payment onConfirm={handleConfirm} />}
    </div>
  );
}

function Step1Route() {
  const store = useGroundStore();
  const { draft } = store;

  const canProceed =
    draft.pickup.address &&
    (draft.tripType === "hourly" || draft.tripType === "full_day" || draft.dropoff.address) &&
    draft.pickupDate &&
    draft.pickupTime;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Where are you going?</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">Enter your trip details below.</p>
      </div>

      {/* Trip type */}
      <div>
        <label className="mb-3 block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Trip Type
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRIP_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => store.setTripType(t.key)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                draft.tripType === t.key
                  ? "border-champagne bg-champagne/5"
                  : "border-[var(--color-hairline)] hover:border-champagne/50"
              )}
            >
              <div className={cn("mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors", draft.tripType === t.key ? "border-champagne bg-champagne" : "border-[var(--color-hairline-strong)]")} />
              <div>
                <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink)]">{t.label}</div>
                <div className="mt-0.5 text-[12px] text-[var(--color-muted)]">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pickup */}
      <FieldLabel label="Pick-up Address">
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Airport, hotel, or full address"
            value={draft.pickup.address ?? ""}
            onChange={(e) => store.setPickup({ address: e.target.value })}
            className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
          />
        </div>
      </FieldLabel>

      {/* Dropoff */}
      {(draft.tripType === "point_to_point" || draft.tripType === "airport_transfer") && (
        <FieldLabel label="Drop-off Address">
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-forest)]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Airport, hotel, or full address"
              value={draft.dropoff.address ?? ""}
              onChange={(e) => store.setDropoff({ address: e.target.value })}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
            />
          </div>
        </FieldLabel>
      )}

      {/* Date & Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Pick-up Date">
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
            <input
              type="date"
              value={draft.pickupDate}
              onChange={(e) => store.setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            />
          </div>
        </FieldLabel>
        <FieldLabel label="Pick-up Time">
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
            <input
              type="time"
              value={draft.pickupTime}
              onChange={(e) => store.setTime(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            />
          </div>
        </FieldLabel>
      </div>

      {/* Hours (if hourly) */}
      {(draft.tripType === "hourly" || draft.tripType === "full_day") && (
        <FieldLabel label={`Duration (hours) — minimum ${draft.tripType === "full_day" ? "8" : "2"}`}>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
            <input
              type="number"
              min={draft.tripType === "full_day" ? 8 : 2}
              max={24}
              value={draft.hours}
              onChange={(e) => store.setHours(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            />
          </div>
        </FieldLabel>
      )}

      {/* Passengers / Luggage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Passengers">
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
            <select
              value={draft.passengers}
              onChange={(e) => store.setPassengers(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-8 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                <option key={n} value={n}>{n} passenger{n !== 1 ? "s" : ""}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={1.75} />
          </div>
        </FieldLabel>
        <FieldLabel label="Luggage Pieces">
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
            <select
              value={draft.luggage}
              onChange={(e) => store.setLuggage(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-8 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            >
              {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                <option key={n} value={n}>{n} bag{n !== 1 ? "s" : ""}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={1.75} />
          </div>
        </FieldLabel>
      </div>

      {/* Flight number */}
      {draft.tripType === "airport_transfer" && (
        <FieldLabel label="Flight Number (optional — for meet & greet)">
          <input
            type="text"
            placeholder="e.g. AA 100"
            value={draft.pickup.flightNumber ?? ""}
            onChange={(e) => store.setPickup({ flightNumber: e.target.value })}
            className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
          />
        </FieldLabel>
      )}

      <button
        type="button"
        disabled={!canProceed}
        onClick={store.nextStep}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-all hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Vehicles
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function Step2Vehicle({ estimatePrice }: { estimatePrice: (v: Vehicle) => number }) {
  const store = useGroundStore();
  const { draft } = store;
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all"
    ? vehicles
    : vehicles.filter((v) => v.category === filter);

  const eligible = filtered.filter(
    (v) => v.passengers >= draft.passengers && v.luggage >= draft.luggage
  );
  const other = filtered.filter(
    (v) => v.passengers < draft.passengers || v.luggage < draft.luggage
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Choose your vehicle</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Showing vehicles for {draft.passengers} passenger{draft.passengers !== 1 ? "s" : ""} and {draft.luggage} bag{draft.luggage !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {["all", "sedan", "suv", "electric", "van", "limousine"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
              filter === cat
                ? "bg-[var(--color-ink)] text-white"
                : "border border-[var(--color-hairline)] text-[var(--color-muted)] hover:border-champagne hover:text-champagne"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eligible.map((v) => (
          <VehicleCard
            key={v.id}
            vehicle={v as Vehicle}
            selected={draft.selectedVehicle?.id === v.id}
            estimatedPrice={estimatePrice(v as Vehicle)}
            onSelect={(veh) => store.setVehicle(veh)}
          />
        ))}
        {other.length > 0 && (
          <>
            <div className="col-span-full">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-hairline)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                  Capacity exceeded for your selections
                </span>
                <div className="h-px flex-1 bg-[var(--color-hairline)]" />
              </div>
            </div>
            {other.map((v) => (
              <div key={v.id} className="opacity-50">
                <VehicleCard
                  vehicle={v as Vehicle}
                  estimatedPrice={estimatePrice(v as Vehicle)}
                />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={store.prevStep}
          className="rounded-full border border-[var(--color-hairline-strong)] px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!draft.selectedVehicle}
          onClick={store.nextStep}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-all hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Step3Details() {
  const store = useGroundStore();
  const { draft } = store;

  const canProceed = draft.passenger.firstName && draft.passenger.lastName && draft.passenger.email && draft.passenger.phone;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Passenger details</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">We'll send your confirmation and chauffeur details here.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="First Name">
          <input
            type="text"
            placeholder="James"
            value={draft.passenger.firstName ?? ""}
            onChange={(e) => store.setPassenger({ firstName: e.target.value })}
            className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
          />
        </FieldLabel>
        <FieldLabel label="Last Name">
          <input
            type="text"
            placeholder="Smith"
            value={draft.passenger.lastName ?? ""}
            onChange={(e) => store.setPassenger({ lastName: e.target.value })}
            className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
          />
        </FieldLabel>
      </div>

      <FieldLabel label="Email Address">
        <input
          type="email"
          placeholder="james@example.com"
          value={draft.passenger.email ?? ""}
          onChange={(e) => store.setPassenger({ email: e.target.value })}
          className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
        />
      </FieldLabel>

      <FieldLabel label="Phone Number">
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={draft.passenger.phone ?? ""}
          onChange={(e) => store.setPassenger({ phone: e.target.value })}
          className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
        />
      </FieldLabel>

      <FieldLabel label="Special Requests (optional)">
        <textarea
          placeholder="e.g. child seat required, specific bottled water, silence preferred…"
          value={draft.specialRequests}
          onChange={(e) => store.setSpecialRequests(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
        />
      </FieldLabel>

      <div className="flex gap-3">
        <button type="button" onClick={store.prevStep} className="rounded-full border border-[var(--color-hairline-strong)] px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne">Back</button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={store.nextStep}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-all hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
        >
          Review Booking
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Step4Review({ estimatePrice }: { estimatePrice: (v: Vehicle) => number }) {
  const store = useGroundStore();
  const { draft } = store;
  const price = draft.selectedVehicle ? estimatePrice(draft.selectedVehicle as Vehicle) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Review your booking</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">Confirm everything looks correct before payment.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
        <ReviewRow label="Trip Type" value={draft.tripType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} />
        <ReviewRow label="Pick-up" value={draft.pickup.address ?? "—"} />
        {draft.dropoff.address && <ReviewRow label="Drop-off" value={draft.dropoff.address} />}
        <ReviewRow label="Date & Time" value={`${draft.pickupDate} at ${draft.pickupTime}`} />
        {(draft.tripType === "hourly" || draft.tripType === "full_day") && (
          <ReviewRow label="Duration" value={`${draft.hours} hours`} />
        )}
        <ReviewRow label="Passengers" value={`${draft.passengers}`} />
        <ReviewRow label="Vehicle" value={draft.selectedVehicle ? `${draft.selectedVehicle.name} (${draft.selectedVehicle.model})` : "—"} />
        <ReviewRow label="Passenger" value={`${draft.passenger.firstName} ${draft.passenger.lastName}`} />
        <ReviewRow label="Email" value={draft.passenger.email ?? "—"} />
        <ReviewRow label="Phone" value={draft.passenger.phone ?? "—"} />
        {draft.specialRequests && <ReviewRow label="Requests" value={draft.specialRequests} />}
        <div className="flex items-center justify-between border-t border-[var(--color-hairline-strong)] bg-[var(--color-ivory)] px-6 py-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink)]">Total</span>
          <span className="font-serif text-[28px] leading-none text-[var(--color-ink)]">${price}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={store.prevStep} className="rounded-full border border-[var(--color-hairline-strong)] px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne">Back</button>
        <button
          type="button"
          onClick={store.nextStep}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-all hover:bg-champagne"
        >
          Proceed to Payment
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Step5Payment({ onConfirm }: { onConfirm: () => void }) {
  const store = useGroundStore();
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1800);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Payment</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">All transactions are encrypted and processed securely.</p>
      </div>

      <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
        <FieldLabel label="Card Number">
          <div className="relative">
            <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
            />
          </div>
        </FieldLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Expiry">
            <input
              type="text"
              placeholder="MM / YY"
              maxLength={7}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
            />
          </FieldLabel>
          <FieldLabel label="CVC">
            <input
              type="text"
              placeholder="•••"
              maxLength={4}
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
            />
          </FieldLabel>
        </div>
        <div className="mt-4">
          <FieldLabel label="Name on Card">
            <input
              type="text"
              placeholder="James Smith"
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
            />
          </FieldLabel>
        </div>
      </div>

      <p className="flex items-start gap-2 text-[12px] text-[var(--color-muted)]">
        <Car className="mt-0.5 h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.75} />
        Free cancellation up to 1 hour before pickup. No fees for flight delays on airport transfers.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={store.prevStep} className="rounded-full border border-[var(--color-hairline-strong)] px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne">Back</button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-champagne px-8 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-ink)] disabled:opacity-60"
        >
          {loading ? "Processing…" : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}

interface ConfirmDraft {
  pickup: { address?: string };
  dropoff: { address?: string };
  pickupDate: string;
  pickupTime: string;
  selectedVehicle: { name: string } | null;
  passenger: { email?: string };
}

function ConfirmationScreen({
  code,
  draft,
  onViewTracking,
}: {
  code: string;
  draft: ConfirmDraft;
  onViewTracking: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center sm:px-8">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/10">
          <CheckCircle className="h-8 w-8 text-champagne" strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="mt-6 font-serif text-[36px] leading-tight text-[var(--color-ink)]">Booking Confirmed</h2>
      <p className="mt-3 text-[14px] text-[var(--color-muted)]">
        Your chauffeur has been notified and will arrive on time.
        A confirmation has been sent to {draft.passenger.email}.
      </p>
      <div className="mt-8 rounded-2xl border border-champagne/30 bg-champagne/5 py-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">Confirmation Code</div>
        <div className="mt-2 font-mono text-[32px] font-medium tracking-widest text-[var(--color-ink)]">{code}</div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white text-left">
        <ReviewRow label="Pick-up" value={draft.pickup.address ?? "—"} />
        {draft.dropoff.address && <ReviewRow label="Drop-off" value={draft.dropoff.address} />}
        <ReviewRow label="Date" value={`${draft.pickupDate} at ${draft.pickupTime}`} />
        <ReviewRow label="Vehicle" value={draft.selectedVehicle?.name ?? "—"} />
        <ReviewRow label="Chauffeur" value="Marcus D. · +1 (555) 000-0001" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onViewTracking}
          className="flex-1 rounded-full bg-[var(--color-ink)] py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
        >
          Track My Ride
        </button>
        <a
          href="/ground"
          className="flex-1 rounded-full border border-[var(--color-hairline-strong)] py-3.5 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline)] px-6 py-3 last:border-b-0">
      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</span>
      <span className="text-right text-[13px] text-[var(--color-ink)]">{value}</span>
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      <Suspense>
        <BookPageInner />
      </Suspense>
    </div>
  );
}
