"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Plane, User, Phone } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-[13px] text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-400";
  const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-600";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 text-neutral-950">
      <div className="pointer-events-none absolute inset-0 mesh-hero opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-linegrid opacity-40" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-5 inline-flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-100">
              <Plane className="h-4 w-4 text-neutral-950" strokeWidth={2} />
            </div>
            <span className="text-[20px] font-semibold tracking-tight text-neutral-950">EXJET</span>
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Create Account</p>
          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-neutral-950">Join EXJET</h1>
          <p className="mt-1 text-[13px] text-neutral-600">Fly private, on demand</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    placeholder="John"
                    required
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Doe"
                    required
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputCls + " py-3"}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls + " py-3"}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className={inputCls + " py-3 pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-950"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Repeat password"
                  required
                  className={inputCls + " py-3 pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-950"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 bg-neutral-100 accent-neutral-950"
              />
              <span className="text-[12px] text-neutral-600">
                I agree to EXJET&apos;s{" "}
                <Link href="#" className="text-neutral-950 underline-offset-4 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-neutral-950 underline-offset-4 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full rounded-full bg-neutral-950 px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-neutral-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
