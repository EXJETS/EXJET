"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-[13px] text-[#0a1628] placeholder:text-neutral-400 outline-none focus:border-[#0d1f3c]";
  const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500";

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%)" }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <svg width="20" height="18" viewBox="0 0 22 20" fill="none">
            <path d="M11 1L21 19H1L11 1Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M11 7L16 19H6L11 7Z" fill="white" fillOpacity="0.35" />
          </svg>
          <span className="font-mono text-[15px] font-semibold tracking-[0.12em] text-white">EXJET</span>
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.45)]">
          Create Account
        </p>
        <h1 className="font-serif text-[2rem] font-normal leading-tight text-white">
          Fly private, on demand.
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" required className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" required className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required className={inputCls + " py-3"} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls + " py-3"} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 8 characters" required className={inputCls + " py-3 pr-10"} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
              <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat password" required className={inputCls + " py-3 pr-10"} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#0d1f3c]" />
            <span className="text-[12px] text-neutral-500">
              I agree to EXJET&apos;s{" "}
              <Link href="#" className="text-[#0d1f3c] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="text-[#0d1f3c] hover:underline">Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" disabled={loading || !agreedToTerms}
            className="w-full rounded-full bg-[#0d1f3c] py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98] disabled:opacity-60">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-neutral-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-[#0d1f3c] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
