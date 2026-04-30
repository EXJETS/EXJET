"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Plane } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 text-[var(--color-ink)]">
      <div className="pointer-events-none absolute inset-0 mesh-hero opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-linegrid opacity-40" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-5 inline-flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)]">
              <Plane className="h-4 w-4 text-[var(--color-ink)]" strokeWidth={2} />
            </div>
            <span className="font-serif text-[20px] text-[var(--color-ink)]">EXJET</span>
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Sign In</p>
          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--color-ink)]">Welcome back</h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">Sign in to manage your bookings</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-8 backdrop-blur-xl">
          {/* Social Login */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory-deep)]">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory-deep)]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Apple
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-hairline)]" /></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" strokeWidth={1.75} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] py-3 pl-10 pr-4 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] outline-none focus:border-[var(--color-champagne)]"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">Password</label>
                <Link href="#" className="text-[11px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" strokeWidth={1.75} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] py-3 pl-10 pr-10 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] outline-none focus:border-[var(--color-champagne)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] transition-colors hover:text-[var(--color-ink)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--color-ink)] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-ink-soft)] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[var(--color-muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
