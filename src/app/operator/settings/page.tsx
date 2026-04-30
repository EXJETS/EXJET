"use client";

import { useState } from "react";
import { Building2, CreditCard, Bell, Shield, Save } from "lucide-react";

export default function OperatorSettingsPage() {
  const [company, setCompany] = useState({ name: "Sky Charter Co.", email: "ops@skycharter.com", phone: "+1 (305) 555-0192", address: "1000 Brickell Ave, Miami, FL 33131", faa: "SCHE0024", tax: "87-1234567" });
  const [notifications, setNotifications] = useState({ newBooking: true, payouts: true, maintenance: true, reviews: false, marketing: false });

  const toggle = (k: keyof typeof notifications) => setNotifications(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-6">Settings</h1>

      {/* Company Info */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-6 mb-5">
        <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-champagne" /> Company Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Company Name",   key: "name",    type: "text"  },
            { label: "Email",          key: "email",   type: "email" },
            { label: "Phone",          key: "phone",   type: "tel"   },
            { label: "FAA Certificate",key: "faa",     type: "text"  },
            { label: "Tax ID",         key: "tax",     type: "text"  },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">{label}</label>
              <input type={type} value={company[key as keyof typeof company]}
                onChange={(e) => setCompany(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm focus:border-[var(--color-hairline-strong)] outline-none bg-[var(--color-ivory)] text-[var(--color-ink)]" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Address</label>
            <input type="text" value={company.address}
              onChange={(e) => setCompany(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] text-sm focus:border-[var(--color-hairline-strong)] outline-none bg-[var(--color-ivory)] text-[var(--color-ink)]" />
          </div>
        </div>
      </div>

      {/* Bank / Payout */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-6 mb-5">
        <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-champagne" /> Payout Settings</h2>
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-ivory-deep)] border border-[var(--color-hairline)] mb-3">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Chase Business Checking</p>
            <p className="text-xs text-[var(--color-subtle)]">••••••••4821 · Routing: ••••••1234</p>
          </div>
          <button className="text-xs text-champagne hover:text-[var(--color-ink-soft)] font-medium">Change</button>
        </div>
        <p className="text-xs text-[var(--color-subtle)]">Payouts are processed on the last day of each month. Allow 1-3 business days.</p>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-6 mb-5">
        <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-champagne" /> Notifications</h2>
        <div className="space-y-3">
          {[
            { key: "newBooking",   label: "New booking requests",       sub: "Get notified when a new booking comes in" },
            { key: "payouts",     label: "Payout confirmations",        sub: "Monthly payout processed notifications"   },
            { key: "maintenance", label: "Maintenance reminders",       sub: "Scheduled and due maintenance alerts"     },
            { key: "reviews",     label: "New reviews",                  sub: "When a client leaves a review"           },
            { key: "marketing",   label: "Marketing & promotions",      sub: "Tips and platform updates from EXJET"     },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-[var(--color-hairline)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
                <p className="text-xs text-[var(--color-subtle)]">{sub}</p>
              </div>
              <button onClick={() => toggle(key as keyof typeof notifications)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-champagne" : "bg-[var(--color-bone)]"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-champagne text-white font-semibold hover:bg-[var(--color-ink-soft)] transition-all flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );
}
