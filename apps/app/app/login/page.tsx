"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { AuthFrame } from "@/components/AuthFrame";
import { ActionError, Field } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setMe } = useMe();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAction(api.login);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const me = await login.run({ email, password });
    if (me) {
      setMe(me);
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : me.next_step === "ready" ? "/trips" : "/onboarding");
    }
  }
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 16 }} noValidate>
      <Field label="Email" id="email">
        <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" id="password">
        <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <ActionError error={login.error} />
      <button className="btn btn-primary btn-block" type="submit" disabled={login.pending || !email || !password}>
        {login.pending ? "Signing in" : "Sign in"}
      </button>
      <p className="muted small">
        New to EXJET? <Link href="/signup">Create an account</Link>. You can also <Link href="/aircraft">browse aircraft</Link> without one.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthFrame title="Sign in" sub="Member platform">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  );
}
