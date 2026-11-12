"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { AuthFrame } from "@/components/AuthFrame";
import { ActionError, Banner, Field } from "@/components/ui";

function Inner() {
  const token = useSearchParams().get("token");
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  const reset = useAction(api.resetPassword);
  if (!token) return <Banner tone="problem">This page needs the link from your reset email. <Link href="/forgot-password">Request a new one</Link>.</Banner>;
  return done ? (
    <div style={{ display: "grid", gap: 16 }}>
      <Banner tone="ok" live>Password changed. All other sessions were signed out.</Banner>
      <Link className="btn btn-primary" href="/login">Sign in</Link>
    </div>
  ) : (
    <form style={{ display: "grid", gap: 16 }} onSubmit={async (e) => { e.preventDefault(); const r = await reset.run(token, pw); if (r !== undefined) setDone(true); }}>
      <Field label="New password" id="pw" help="At least 10 characters."><input id="pw" className="input" type="password" required minLength={10} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <ActionError error={reset.error} />
      <button className="btn btn-primary btn-block" disabled={reset.pending || pw.length < 10}>{reset.pending ? "Saving" : "Set new password"}</button>
      {reset.error ? <p className="small"><Link href="/forgot-password">Request a new link</Link></p> : null}
    </form>
  );
}

export default function ResetPasswordPage() {
  return <AuthFrame title="Choose a new password"><Suspense><Inner /></Suspense></AuthFrame>;
}
