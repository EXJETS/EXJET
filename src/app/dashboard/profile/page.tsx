"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Save, Plane } from "lucide-react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "John", lastName: "Doe", email: "john.doe@example.com",
    phone: "+1 (555) 123-4567", dob: "1985-06-15",
    preferredCategory: "heavy", dietary: "None", specialRequests: "",
    passportNumber: "US1234567", passportExpiry: "2030-12-31", nationality: "United States",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const inputCls =
    "w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-3 py-2.5 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] outline-none focus:border-[var(--color-hairline-strong)]";
  const dateCls = inputCls + "";
  const labelCls = "mb-1 block font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]";

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ivory-deep)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back to Dashboard
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] text-[20px] font-semibold text-[var(--color-ink)]">
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[var(--color-ink)]">{form.firstName} {form.lastName}</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">EXJET Premium Member</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-6 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-[var(--color-muted)]" strokeWidth={1.75} />
            <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Personal Information</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} className={dateCls} />
            </div>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="mb-6 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Plane className="h-3.5 w-3.5 text-[var(--color-muted)]" strokeWidth={1.75} />
            <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Travel Preferences</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Preferred Cabin Class</label>
              <select
                value={form.preferredCategory}
                onChange={(e) => update("preferredCategory", e.target.value)}
                className={inputCls}
              >
                <option value="light">Light Jet</option>
                <option value="midsize">Midsize Jet</option>
                <option value="super_midsize">Super Midsize</option>
                <option value="heavy">Heavy Jet</option>
                <option value="ultra_long">Ultra Long Range</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Dietary Requirements</label>
              <input
                type="text"
                value={form.dietary}
                onChange={(e) => update("dietary", e.target.value)}
                className={inputCls}
                placeholder="None"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Special Requests</label>
              <textarea
                value={form.specialRequests}
                onChange={(e) => update("specialRequests", e.target.value)}
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Any special requirements for your flights..."
              />
            </div>
          </div>
        </div>

        {/* Passport */}
        <div className="mb-6 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-6 backdrop-blur-xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Passport Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Passport Number</label>
              <input
                type="text"
                value={form.passportNumber}
                onChange={(e) => update("passportNumber", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input
                type="date"
                value={form.passportExpiry}
                onChange={(e) => update("passportExpiry", e.target.value)}
                className={dateCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nationality</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => update("nationality", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-ink-soft)] active:scale-[0.98]">
          <Save className="h-3.5 w-3.5" strokeWidth={2} /> Save Changes
        </button>
      </div>
    </div>
  );
}
