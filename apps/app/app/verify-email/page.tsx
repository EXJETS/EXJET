"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { AuthFrame } from "@/components/AuthFrame";
import { ActionError, Banner, Field, Spinner } from "@/components/ui";

function Inner() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const { setMe } = useMe();
  const verify = useAction(api.verifyEmail);
  const resend = useAction(api.resendVerification);
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    void verify.run(token).then((me) => {
      if (me) {
        setMe(me);
        router.replace(me.next_step === "ready" ? "/trips" : "/onboarding");
      }
    });
  }, [token, verify, setMe, router]);

  return (
    <AuthFrame title="Verify your email">
      <div style={{ display: "grid", gap: 16 }}>
        {!token ? <Banner tone="problem">This page needs the link from your verification email.</Banner> : null}
        {token && !verify.error ? <Banner><Spinner label="Verifying your email" /></Banner> : null}
        <ActionError error={verify.error} />
        {!token || verify.error ? (
          <form style={{ display: "grid", gap: 12 }} onSubmit={async (e) => { e.preventDefault(); if (await resend.run(email)) setResent(true); }}>
            <p className="muted">Send a new verification link to your address.</p>
            <Field label="Email" id="email"><input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <ActionError error={resend.error} />
            {resent ? <Banner tone="ok" live>If the account is waiting for verification, a new link is on its way.</Banner> : null}
            <button className="btn btn-primary" disabled={resend.pending || !email}>{resend.pending ? "Sending" : "Send a new link"}</button>
          </form>
        ) : null}
        <p className="small"><Link href="/login">Back to sign in</Link></p>
      </div>
    </AuthFrame>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><Inner /></Suspense>;
}
