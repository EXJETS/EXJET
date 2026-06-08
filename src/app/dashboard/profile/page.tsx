"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Save, Plane, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 900);
  };

  const [form, setForm] = useState({
    firstName: "John", lastName: "Doe", email: "john.doe@example.com",
    phone: "+1 (555) 123-4567", dob: "1985-06-15",
    preferredCategory: "heavy", dietary: "None", specialRequests: "",
    passportNumber: "US1234567", passportExpiry: "2030-12-31", nationality: "United States",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-[#0a1628] placeholder:text-neutral-400 outline-none focus:border-[#0d1f3c]";
  const dateCls = inputCls + "";
  const labelCls = "mb-1 block font-mono text-[10px] uppercase tracking-widest text-neutral-600";

  return (
    <div className="min-h-screen bg-[#f5f0eb] text-[#0a1628]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back to Dashboard
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-white text-[20px] font-semibold text-[#0a1628]">
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#0a1628]">{form.firstName} {form.lastName}</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">EXJET Premium Member</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-neutral-600" strokeWidth={1.75} />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Personal Information</p>
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
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Plane className="h-3.5 w-3.5 text-neutral-600" strokeWidth={1.75} />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Travel Preferences</p>
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
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-neutral-600">Passport Details</p>
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

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0d1f3c]" strokeWidth={2} />
            <p className="text-[13px] text-neutral-700">Profile saved successfully.</p>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <>Saving…</>
          ) : (
            <><Save className="h-3.5 w-3.5" strokeWidth={2} /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}
