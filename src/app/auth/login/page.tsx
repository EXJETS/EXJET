"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "forgot-sent">("login");
  const [forgotEmail, setForgotEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); }, 1500);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setMode("forgot-sent"); }, 1200);
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-[13px] text-[#0a1628] placeholder:text-neutral-400 outline-none focus:border-[#0d1f3c]";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f0eb] px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
            <path d="M11 1L21 19H1L11 1Z" fill="none" stroke="#0d1f3c" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M11 7L16 19H6L11 7Z" fill="#0d1f3c" fillOpacity="0.4" />
          </svg>
          <span className="font-mono text-[15px] font-semibold tracking-[0.12em] text-[#0d1f3c]">EXJET</span>
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-400">
          {mode === "login" ? "Member Sign In" : "Password Reset"}
        </p>
        <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-[#0a1628]">
          {mode === "login" ? "Welcome back." : mode === "forgot-sent" ? "Check your inbox." : "Forgot password?"}
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

        {/* Forgot-sent state */}
        {mode === "forgot-sent" && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(13,31,60,0.08)]">
              <CheckCircle2 className="h-7 w-7 text-[#0d1f3c]" strokeWidth={1.75} />
            </div>
            <p className="text-[14px] text-neutral-600">
              If an account exists for <span className="font-semibold text-[#0a1628]">{forgotEmail}</span>,
              you&apos;ll receive a reset link within 5 minutes.
            </p>
            <button
              onClick={() => { setMode("login"); setForgotEmail(""); }}
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0d1f3c] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back to sign in
            </button>
          </div>
        )}

        {/* Forgot password form */}
        {mode === "forgot" && (
          <>
            <p className="mb-5 text-[13px] text-neutral-500">
              Enter your email and we&apos;ll send a password reset link.
            </p>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                  <input
                    type="email" value={forgotEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com" required className={inputCls}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-full bg-[#0d1f3c] py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] disabled:opacity-60">
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
            <button
              onClick={() => setMode("login")}
              className="mt-4 flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-[#0a1628]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back to sign in
            </button>
          </>
        )}

        {/* Login form */}
        {mode === "login" && (
          <>
            {/* Social */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[12px] font-medium text-[#0a1628] transition-colors hover:bg-neutral-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[12px] font-medium text-[#0a1628] transition-colors hover:bg-neutral-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Apple
              </Link>
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">or email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                  <input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-[#0d1f3c] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="••••••••" required className={inputCls} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-full bg-[#0d1f3c] py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98] disabled:opacity-60">
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="mt-5 text-center text-[13px] text-neutral-500">
              No account?{" "}
              <Link href="/auth/register" className="font-medium text-[#0d1f3c] hover:underline">Create one</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
