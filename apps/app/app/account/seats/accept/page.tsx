"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { ActionError, Banner, Card, PageHeader } from "@/components/ui";

function Inner() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const { me, setMe } = useMe();
  const accept = useAction(api.acceptSeat);
  const [done, setDone] = useState(false);
  if (!token) return <Banner tone="problem">This page needs the link from your seat invitation email.</Banner>;
  // Not signed in: the shell already routes to /login?next=<this page with the token>. Signed-in as another email: the API refuses.
  return (
    <Card title="Join a membership">
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <p>You are signed in as <strong>{me?.user.email}</strong>. Accept only if this is the email address the invitation was sent to.</p>
        <p className="muted">Accepting gives you a seat on the account owner&apos;s membership. You then complete your own identity check; operator details unlock after EXJET approves it.</p>
        <ActionError error={accept.error} />
        {accept.error ? <p className="small muted">Wrong account? <Link href="/login">Sign in with the invited email</Link>, then open the link again.</p> : null}
        {done ? <Banner tone="ok" live>Seat accepted.</Banner> : null}
        <div>
          <button className="btn btn-primary" disabled={accept.pending || done} onClick={async () => {
            const r = await accept.run(token);
            if (r) { setMe(r); setDone(true); router.replace(r.next_step === "ready" ? "/trips" : "/onboarding"); }
          }}>{accept.pending ? "Accepting" : "Accept seat"}</button>
        </div>
      </div>
    </Card>
  );
}

export default function AcceptSeatPage() {
  return (
    <>
      <PageHeader title="Seat invitation" />
      <Suspense><Inner /></Suspense>
    </>
  );
}
