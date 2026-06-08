"use client";

import React, { useState } from "react";
import { Settings, DollarSign, Shield, Bell, Save, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [platform, setPlatform] = useState({ commission: "10", minBookingHours: "2", currency: "USD", timezone: "America/New_York" });
  const [flags, setFlags] = useState({ maintenanceMode: false, newRegistrations: true, operatorOnboarding: true, publicFleetTracking: true, requirePhotoVerification: true });
  const toggle = (k: keyof typeof flags) => setFlags((prev: typeof flags) => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>

      {/* General */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-amber-500" /> General</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Default Currency",    key: "currency",           type: "text" },
            { label: "Default Timezone",    key: "timezone",           type: "text" },
            { label: "Min Booking (hours)", key: "minBookingHours",    type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type={type} value={platform[key as keyof typeof platform]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatform((prev: typeof platform) => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-amber-500" /> Revenue Settings</h2>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Commission (%)</label>
          <input type="number" min="0" max="30" value={platform.commission}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatform((prev: typeof platform) => ({ ...prev, commission: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
          <p className="text-xs text-gray-400 mt-1.5">Applied to every booking as platform fee</p>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-amber-500" /> Feature Flags</h2>
        <div className="space-y-3">
          {[
            { key: "maintenanceMode",            label: "Maintenance Mode",              sub: "Take the platform offline for maintenance", danger: true  },
            { key: "newRegistrations",           label: "New User Registrations",        sub: "Allow new clients to register"                           },
            { key: "operatorOnboarding",         label: "Operator Onboarding",           sub: "Allow new operators to apply"                            },
            { key: "publicFleetTracking",        label: "Public Fleet Tracking",         sub: "Show live fleet map on /tracking to all visitors"        },
            { key: "requirePhotoVerification",   label: "Require Photo Verification",    sub: "Operators must upload interior & exterior photos"        },
          ].map(({ key, label, sub, danger }) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <div>
                <p className={`text-sm font-medium ${danger && flags[key as keyof typeof flags] ? "text-red-600" : "text-gray-900"}`}>{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <button onClick={() => toggle(key as keyof typeof flags)}
                className={`relative w-11 h-6 rounded-full transition-colors ${flags[key as keyof typeof flags] ? (danger ? "bg-red-500" : "bg-amber-500") : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${flags[key as keyof typeof flags] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-neutral-950 font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
}
