"use client";

import { useState } from "react";
import {
  PlaneTakeoff,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Users,
  X,
  Check,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface EmptyLegDraft {
  id: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  date: string;
  departTime: string;
  aircraft: string;
  category: string;
  capacity: number;
  retailPrice: number;
  price: number;
  discountPct: number;
  status: "active" | "draft" | "expired";
}

const FLEET = [
  { name: "Gulfstream G500", reg: "N401GX", category: "heavy", capacity: 14 },
  { name: "Challenger 350", reg: "N350CX", category: "super_midsize", capacity: 9 },
  { name: "Citation Longitude", reg: "N700CL", category: "super_midsize", capacity: 10 },
  { name: "Praetor 600", reg: "N600PX", category: "super_midsize", capacity: 12 },
];

const SAMPLE_LEGS: EmptyLegDraft[] = [
  {
    id: "el-op-1",
    fromCode: "KTEB",
    fromCity: "Teterboro",
    toCode: "KMIA",
    toCity: "Miami",
    date: "2026-06-08",
    departTime: "14:00",
    aircraft: "Gulfstream G500",
    category: "heavy",
    capacity: 14,
    retailPrice: 62000,
    price: 24000,
    discountPct: 61,
    status: "active",
  },
  {
    id: "el-op-2",
    fromCode: "KLAX",
    fromCity: "Los Angeles",
    toCode: "KLAS",
    toCity: "Las Vegas",
    date: "2026-06-12",
    departTime: "18:30",
    aircraft: "Challenger 350",
    category: "super_midsize",
    capacity: 9,
    retailPrice: 18000,
    price: 7200,
    discountPct: 60,
    status: "active",
  },
  {
    id: "el-op-3",
    fromCode: "KORD",
    fromCity: "Chicago",
    toCode: "KDFW",
    toCity: "Dallas",
    date: "2026-05-28",
    departTime: "09:00",
    aircraft: "Praetor 600",
    category: "super_midsize",
    capacity: 12,
    retailPrice: 35000,
    price: 14000,
    discountPct: 60,
    status: "expired",
  },
];

const today = new Date().toISOString().split("T")[0];

interface FormState {
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  date: string;
  departTime: string;
  aircraftIndex: number;
  retailPrice: string;
  price: string;
}

const emptyForm: FormState = {
  fromCode: "",
  fromCity: "",
  toCode: "",
  toCity: "",
  date: "",
  departTime: "",
  aircraftIndex: 0,
  retailPrice: "",
  price: "",
};

export default function OperatorEmptyLegsPage() {
  const [legs, setLegs] = useState<EmptyLegDraft[]>(SAMPLE_LEGS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const aircraft = FLEET[form.aircraftIndex];
  const discountPct =
    form.retailPrice && form.price
      ? Math.round(
          (1 - Number(form.price) / Number(form.retailPrice)) * 100
        )
      : 0;

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(leg: EmptyLegDraft) {
    const ai = FLEET.findIndex((f) => f.name === leg.aircraft);
    setForm({
      fromCode: leg.fromCode,
      fromCity: leg.fromCity,
      toCode: leg.toCode,
      toCity: leg.toCity,
      date: leg.date,
      departTime: leg.departTime,
      aircraftIndex: ai >= 0 ? ai : 0,
      retailPrice: String(leg.retailPrice),
      price: String(leg.price),
    });
    setEditingId(leg.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.fromCode || !form.toCode || !form.date || !form.retailPrice || !form.price) return;
    const ac = FLEET[form.aircraftIndex];
    const draft: EmptyLegDraft = {
      id: editingId ?? `el-op-${Date.now()}`,
      fromCode: form.fromCode.toUpperCase(),
      fromCity: form.fromCity,
      toCode: form.toCode.toUpperCase(),
      toCity: form.toCity,
      date: form.date,
      departTime: form.departTime || "TBD",
      aircraft: ac.name,
      category: ac.category,
      capacity: ac.capacity,
      retailPrice: Number(form.retailPrice),
      price: Number(form.price),
      discountPct,
      status: "active",
    };

    if (editingId) {
      setLegs((prev) => prev.map((l) => (l.id === editingId ? draft : l)));
    } else {
      setLegs((prev) => [draft, ...prev]);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
    }, 1200);
  }

  function handleDelete(id: string) {
    setLegs((prev) => prev.filter((l) => l.id !== id));
    setDeleteConfirm(null);
  }

  const activeLegs = legs.filter((l) => l.status === "active");
  const expiredLegs = legs.filter((l) => l.status !== "active");

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] p-6">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              Operator Tools
            </span>
            <h1 className="mt-2 font-serif text-[36px] leading-none text-[var(--color-ink)]">
              Empty Legs
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">
              Post repositioning flights to reach qualified charter clients across the EXJET network.
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-champagne"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Post Empty Leg
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)]">
          <StatCell label="Active listings" value={String(activeLegs.length)} />
          <StatCell
            label="Avg. discount"
            value={`${Math.round(activeLegs.reduce((s, l) => s + l.discountPct, 0) / Math.max(activeLegs.length, 1))}%`}
          />
          <StatCell
            label="Est. revenue"
            value={formatCurrency(activeLegs.reduce((s, l) => s + l.price, 0))}
          />
        </div>

        {/* Active listings */}
        {activeLegs.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                Active
              </span>
              <span className="rounded-full border border-champagne/30 bg-champagne/10 px-2 py-0.5 font-mono text-[10px] text-champagne">
                {activeLegs.length}
              </span>
            </div>
            <div className="space-y-3">
              {activeLegs.map((leg) => (
                <LegRow
                  key={leg.id}
                  leg={leg}
                  onEdit={() => openEdit(leg)}
                  onDelete={() => setDeleteConfirm(leg.id)}
                  deleteConfirm={deleteConfirm === leg.id}
                  onConfirmDelete={() => handleDelete(leg.id)}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Expired listings */}
        {expiredLegs.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
                Expired
              </span>
            </div>
            <div className="space-y-3 opacity-60">
              {expiredLegs.map((leg) => (
                <LegRow
                  key={leg.id}
                  leg={leg}
                  onEdit={() => openEdit(leg)}
                  onDelete={() => setDeleteConfirm(leg.id)}
                  deleteConfirm={deleteConfirm === leg.id}
                  onConfirmDelete={() => handleDelete(leg.id)}
                  onCancelDelete={() => setDeleteConfirm(null)}
                />
              ))}
            </div>
          </div>
        )}

        {legs.length === 0 && !showForm && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-hairline-strong)] bg-white py-24 text-center">
            <PlaneTakeoff className="h-10 w-10 text-[var(--color-bone)]" strokeWidth={1} />
            <h2 className="mt-5 font-serif text-[24px] text-[var(--color-ink)]">
              No empty legs yet
            </h2>
            <p className="mt-2 text-[13px] text-[var(--color-muted)]">
              Post your first repositioning flight to get started.
            </p>
            <button
              onClick={openNew}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[13px] font-medium text-white transition-all hover:bg-champagne"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              Post Empty Leg
            </button>
          </div>
        )}
      </div>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-[0_0_80px_-20px_rgba(0,0,0,0.4)]">
            {/* Form header */}
            <div className="flex items-center justify-between border-b border-[var(--color-hairline)] px-7 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                  {editingId ? "Edit listing" : "New listing"}
                </p>
                <h2 className="mt-0.5 font-serif text-[24px] text-[var(--color-ink)]">
                  {editingId ? "Update Empty Leg" : "Post Empty Leg"}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 px-7 py-6">
              {/* Aircraft select */}
              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Aircraft
                </label>
                <div className="relative">
                  <select
                    value={form.aircraftIndex}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        aircraftIndex: Number(e.target.value),
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] py-3 pl-4 pr-10 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  >
                    {FLEET.map((f, i) => (
                      <option key={f.reg} value={i}>
                        {f.name} · {f.reg} · {f.capacity} seats
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" strokeWidth={2} />
                </div>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                  {aircraft.capacity} seats · {aircraft.category.replace("_", " ")}
                </p>
              </div>

              {/* Route */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Departure ICAO
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KTEB"
                    maxLength={6}
                    value={form.fromCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fromCode: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 font-mono text-[14px] uppercase tracking-widest text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Departure City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Teterboro"
                    value={form.fromCity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fromCity: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Arrival ICAO
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KMIA"
                    maxLength={6}
                    value={form.toCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, toCode: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 font-mono text-[14px] uppercase tracking-widest text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Arrival City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Miami"
                    value={form.toCity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, toCity: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
              </div>

              {/* Date & time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Flight Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={form.departTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, departTime: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Retail Charter Price (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 48000"
                    min={0}
                    value={form.retailPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, retailPrice: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                    Empty Leg Price (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 18500"
                    min={0}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-champagne"
                  />
                </div>
              </div>

              {/* Discount preview */}
              {discountPct > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-champagne/30 bg-champagne/8 px-5 py-4">
                  <Tag className="h-4 w-4 text-champagne" strokeWidth={1.75} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
                      {discountPct}% discount applied
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">
                      Clients save{" "}
                      {formatCurrency(
                        Number(form.retailPrice) - Number(form.price)
                      )}{" "}
                      on this leg.
                    </p>
                  </div>
                </div>
              )}

              {/* Legal note */}
              <p className="text-[12px] leading-relaxed text-[var(--color-subtle)]">
                By posting, you confirm this flight meets all applicable
                regulatory requirements and that ARGUS/Wyvern standards apply
                to the operating crew and aircraft.
              </p>
            </div>

            {/* Form footer */}
            <div className="border-t border-[var(--color-hairline)] px-7 py-5">
              <button
                onClick={handleSave}
                disabled={
                  !form.fromCode ||
                  !form.toCode ||
                  !form.date ||
                  !form.retailPrice ||
                  !form.price
                }
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-medium transition-all",
                  saved
                    ? "bg-green-600 text-white"
                    : "bg-[var(--color-ink)] text-white hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Saved
                  </>
                ) : (
                  <>
                    {editingId ? "Update Listing" : "Publish Empty Leg"}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-white px-6 py-6 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
        {label}
      </span>
      <span className="font-serif text-[28px] leading-none text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}

function LegRow({
  leg,
  onEdit,
  onDelete,
  deleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: {
  leg: EmptyLegDraft;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const when = new Date(leg.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-[var(--color-hairline)] bg-white p-5 transition-all",
        "hover:border-[var(--color-hairline-strong)]"
      )}
    >
      {/* Route */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
              {leg.fromCity}
            </p>
            <p className="font-serif text-[24px] leading-none text-[var(--color-ink)]">
              {leg.fromCode}
            </p>
          </div>
          <PlaneTakeoff className="h-4 w-4 text-champagne" strokeWidth={1.5} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
              {leg.toCity}
            </p>
            <p className="font-serif text-[24px] leading-none text-[var(--color-ink)]">
              {leg.toCode}
            </p>
          </div>
        </div>

        {/* Mobile: route text */}
        <div className="min-w-0 sm:hidden">
          <p className="font-serif text-[18px] text-[var(--color-ink)]">
            {leg.fromCode} → {leg.toCode}
          </p>
        </div>

        {/* Meta chips */}
        <div className="hidden min-w-0 flex-wrap items-center gap-2 md:flex">
          <Chip icon={Calendar} label={when} />
          <Chip icon={Clock} label={leg.departTime} />
          <Chip icon={Users} label={`${leg.capacity} seats`} />
          <span className="inline-flex items-center gap-1 rounded-full border border-champagne/30 bg-champagne/8 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
            <Tag className="h-3 w-3" strokeWidth={2} />
            {leg.discountPct}% off
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)] line-through">
          {formatCurrency(leg.retailPrice)}
        </p>
        <p className="font-serif text-[22px] leading-none text-[var(--color-ink)]">
          {formatCurrency(leg.price)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {deleteConfirm ? (
          <>
            <button
              onClick={onConfirmDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            <button
              onClick={onCancelDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-red-500 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-2.5 py-1 font-mono text-[11px] text-[var(--color-muted)]">
      <Icon className="h-3 w-3 text-champagne" strokeWidth={1.75} />
      {label}
    </span>
  );
}
