"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Briefcase, Building2, ChevronRight, LogOut, RotateCcw, Shield } from "lucide-react";
import { Button, Card, Field, Input, PageHeader, Segmented, SkeletonList } from "@/components/ui";
import type { Role, User } from "@/lib/types";
import { useApp, useHydrated, useSession } from "@/store/app-store";

/** Only follow same-site relative paths after sign-in. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/trips/";
}

export function AccountScreen() {
  const ready = useHydrated();
  const user = useSession();
  if (!ready) return <SkeletonList count={2} />;
  return user ? <Profile user={user} /> : <SignIn />;
}

function SignIn() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const signIn = useApp((s) => s.signIn);
  const signInAs = useApp((s) => s.signInAs);
  const register = useApp((s) => s.register);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "in") {
      if (!signIn(form.email)) return setError("No account with that email. Create one, or use a demo account below.");
    } else {
      if (!form.name.trim() || !/\S+@\S+\.\S+/.test(form.email)) return setError("Enter your name and a valid email.");
      const res = register(form);
      if ("error" in res) return setError(res.error);
    }
    router.push(next);
  };

  const demo = (role: Role) => {
    signInAs(role);
    router.push(role === "client" ? next : role === "operator" ? "/operator/" : "/admin/");
  };

  return (
    <>
      <PageHeader eyebrow="Account" title={mode === "in" ? "Welcome back" : "Create your account"} />
      <Card className="mt-6 p-5 sm:p-6">
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
          options={[
            { value: "in", label: "Sign in" },
            { value: "up", label: "Create account" },
          ]}
        />
        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === "up" && (
            <Field label="Full name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </Field>
          )}
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" inputMode="email" />
          </Field>
          {mode === "up" && (
            <Field label="Mobile" hint="For day-of-travel updates from your crew.">
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
            </Field>
          )}
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full">
            {mode === "in" ? "Continue" : "Create account"}
          </Button>
        </form>
      </Card>

      <Card className="mt-4 p-5">
        <p className="eyebrow">Demo accounts</p>
        <p className="mt-1 text-[13px] text-muted">
          This build has no password server yet. Try the app as each role:
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => demo("client")}>Client</Button>
          <Button variant="secondary" onClick={() => demo("operator")}>Operator</Button>
          <Button variant="secondary" onClick={() => demo("admin")}>Admin</Button>
        </div>
      </Card>
    </>
  );
}

function Profile({ user }: { user: User }) {
  const router = useRouter();
  const updateProfile = useApp((s) => s.updateProfile);
  const signOut = useApp((s) => s.signOut);
  const resetDemo = useApp((s) => s.resetDemo);
  const operator = useApp((s) => s.operators.find((o) => o.id === user.operatorId));
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [saved, setSaved] = useState(false);
  const dirty = name !== user.name || phone !== user.phone;

  const links = [
    { href: "/trips/", label: "My trips", icon: Briefcase },
    { href: "/alerts/", label: "Route alerts", icon: Bell },
    ...(user.role === "operator" ? [{ href: "/operator/", label: `Operator console${operator ? ` · ${operator.name}` : ""}`, icon: Building2 }] : []),
    ...(user.role === "admin" ? [{ href: "/admin/", label: "Admin console", icon: Shield }] : []),
  ];

  return (
    <>
      <PageHeader eyebrow={user.role === "client" ? "Account" : `${user.role} account`} title={user.name} description={user.email} />

      <Card className="mt-6 divide-y divide-line">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 px-5 py-4 text-[15px] hover:bg-canvas">
            <l.icon className="h-5 w-5 text-muted" strokeWidth={1.8} />
            <span className="flex-1">{l.label}</span>
            <ChevronRight className="h-4 w-4 text-subtle" />
          </Link>
        ))}
      </Card>

      <Card className="mt-4 space-y-4 p-5">
        <p className="eyebrow">Profile</p>
        <Field label="Full name">
          <Input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
        </Field>
        <Field label="Mobile">
          <Input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} />
        </Field>
        <Button
          disabled={!dirty || !name.trim()}
          onClick={() => {
            updateProfile({ name: name.trim(), phone: phone.trim() });
            setSaved(true);
          }}
        >
          {saved ? "Saved" : "Save changes"}
        </Button>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm("Reset all demo data on this device?")) {
              resetDemo();
              router.push("/");
            }
          }}
        >
          <RotateCcw className="h-4 w-4" /> Reset demo data
        </Button>
      </div>
    </>
  );
}
