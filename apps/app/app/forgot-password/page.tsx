"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { AuthFrame } from "@/components/AuthFrame";
import { ActionError, Banner, Field } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const req = useAction(api.resetRequest);
  return (
    <AuthFrame title="Reset your password" sub="Enter your account email. If it is registered, we send a reset link.">
      <form style={{ display: "grid", gap: 16 }} onSubmit={async (e) => { e.preventDefault(); if (await req.run(email)) setSent(true); }}>
        <Field label="Email" id="email"><input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <ActionError error={req.error} />
        {sent ? <Banner tone="ok" live>If that address is registered, a reset link has been sent. It expires soon and works once.</Banner> : null}
        <button className="btn btn-primary btn-block" disabled={req.pending || !email}>{req.pending ? "Sending" : "Send reset link"}</button>
        <p className="small"><Link href="/login">Back to sign in</Link></p>
      </form>
    </AuthFrame>
  );
}
