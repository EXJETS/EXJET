"use client";

import { useState } from "react";
import { Settings, DollarSign, Shield, Bell, Save, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [platform, setPlatform] = useState({ commission: "10", minBookingHours: "2", currency: "USD", timezone: "America/New_York" });
  const [flags, setFlags] = useState({ maintenanceMode: false, newRegistrations: true, operatorOnboarding: true, publicFleetTracking: true, requirePhotoVerification: true });
  const toggle = (k: keyof typeof flags) => setFlags(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-6">Platform Settings</h1>

      {/* General */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-6 mb-5">
        <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-champagne" /> General</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Default Currency",    key: "currency",           type: "text" },
            { label: "Default Timezone",    key: "timezone",           type: "text" },
            { label: "Min Booking (hours)", key: "minBookingHours",    type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">{label}</label>
              <input type={type} value={platform[key as keyof typeof platform]}
                onChange={(e) => setPlatform(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm focus:border-[var(--color-hairline-strong)] outline-none bg-[var(--color-ivory)] text-[var(--color-ink)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-6 mb-5">
        <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-champagne" /> Revenue Settings</h2>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Platform Commission (%)</label>
          <input type="number" min="0" max="30" value={platform.commission}
            onChange={(e) => setPlatform(prev => ({ ...prev, commission: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm focus:border-[var(--color-hairline-strong)] outline-none bg-[var(--color-ivory)] text-[var(--color-ink)]" />
          <p className="text-xs text-[var(--color-subtle)] mt-1.5">Applied to every booking as platform fee</p>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-6 mb-5">
        <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-champagne" /> Feature Flags</h2>
        <div className="space-y-3">
          {[
            { key: "maintenanceMode",            label: "Maintenance Mode",              sub: "Take the platform offline for maintenance", danger: true  },
            { key: "newRegistrations",           label: "New User Registrations",        sub: "Allow new clients to register"                           },
            { key: "operatorOnboarding",         label: "Operator Onboarding",           sub: "Allow new operators to apply"                            },
            { key: "publicFleetTracking",        label: "Public Fleet Tracking",         sub: "Show live fleet map on /tracking to all visitors"        },
            { key: "requirePhotoVerification",   label: "Require Photo Verification",    sub: "Operators must upload interior & exterior photos"        },
          ].map(({ key, label, sub, danger }) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-[var(--color-hairline)] last:border-0">
              <div>
                <p className={`text-sm font-medium ${danger && flags[key as keyof typeof flags] ? "text-[var(--color-bordeaux)]" : "text-[var(--color-ink)]"}`}>{label}</p>
                <p className="text-xs text-[var(--color-subtle)]">{sub}</p>
              </div>
              <button onClick={() => toggle(key as keyof typeof flags)}
                className={`relative w-11 h-6 rounded-full transition-colors ${flags[key as keyof typeof flags] ? (danger ? "bg-[var(--color-bordeaux)]" : "bg-champagne") : "bg-[var(--color-bone)]"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${flags[key as keyof typeof flags] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-[var(--color-ink)] text-white font-semibold hover:bg-[var(--color-ink-soft)] transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
}
