"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { AuthFrame } from "@/components/AuthFrame";
import { ActionError, Banner, Field } from "@/components/ui";

type Kind = "individual" | "family_office" | "enterprise";
const KINDS: { id: Kind; label: string }[] = [
  { id: "individual", label: "Individual" },
  { id: "family_office", label: "Family Office" },
  { id: "enterprise", label: "Enterprise" },
];

function SignupInner() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { setMe } = useMe();
  const [kind, setKind] = useState<Kind>("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const signup = useAction(api.signup);

  const [company, setCompany] = useState("");
  const [seats, setSeats] = useState("5");
  const [notes, setNotes] = useState("");
  const inquiry = useAction(api.enterpriseInquiry);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState("");
  const resend = useAction(api.resendVerification);
  const [resent, setResent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (kind === "enterprise") return;
    const r = await signup.run({ email, password, full_name: name, account_type: kind, signup_source: "app" });
    if (!r) return;
    if ("user" in r) {
      setMe(r);
      router.replace(next && next.startsWith("/") ? next : "/onboarding");
    } else {
      setPending(true); // 202: no session; the member must verify the email first
    }
  }
  async function sendInquiry(e: React.FormEvent) {
    e.preventDefault();
    const body = { company, seats: Number(seats) || 1, notes: notes.trim() || null, contact_name: name, contact_email: email, contact_phone: phone.trim() || null };
    const r = await inquiry.run(body);
    if (r !== undefined) setSent(true);
  }

  const selector = (
    <div role="radiogroup" aria-label="Account type" className="seg" style={{ width: "100%" }}>
      {KINDS.map((k) => (
        <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} style={{ flex: 1 }} onClick={() => setKind(k.id)}>
          {k.label}
        </button>
      ))}
    </div>
  );

  if (pending) {
    return (
      <AuthFrame title="Check your email" sub="Verify your address to finish creating the account.">
        <div style={{ display: "grid", gap: 16 }}>
          <Banner tone="ok" live>If this address can be registered, we have sent a verification link to {email}. The link expires in 48 hours.</Banner>
          <ActionError error={resend.error} />
          {resent ? <Banner tone="ok" live>Sent again, if the account is waiting for verification.</Banner> : null}
          <div className="actions">
            <button className="btn" disabled={resend.pending} onClick={async () => { const r = await resend.run(email); if (r) setResent(true); }}>{resend.pending ? "Sending" : "Resend email"}</button>
            <Link className="btn" href="/login">Back to sign in</Link>
          </div>
        </div>
      </AuthFrame>
    );
  }

  if (kind === "enterprise") {
    return (
      <AuthFrame title="Enterprise inquiry" sub="Enterprise membership is arranged with our team. Tell us about your organization.">
        <div style={{ display: "grid", gap: 16 }}>
          {selector}
          {sent ? (
            <Banner tone="ok" live>Inquiry received. We will contact you at {email}.</Banner>
          ) : (
            <form onSubmit={sendInquiry} style={{ display: "grid", gap: 16 }}>
              <Field label="Your name" id="e-name"><input id="e-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Field>
              <Field label="Work email" id="e-email"><input id="e-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
              <Field label="Phone (optional)" id="e-phone"><input id="e-phone" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></Field>
              <Field label="Company" id="company"><input id="company" className="input" required value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" /></Field>
              <Field label="Seats needed" id="seats"><input id="seats" className="input" type="number" min={1} required value={seats} onChange={(e) => setSeats(e.target.value)} inputMode="numeric" /></Field>
              <Field label="Notes" id="notes"><textarea id="notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
              <ActionError error={inquiry.error} />
              <button className="btn btn-primary btn-block" disabled={inquiry.pending || !company || !email || !name}>{inquiry.pending ? "Sending" : "Send inquiry"}</button>
            </form>
          )}
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Create your account" sub="Browsing is open to everyone. Requests and operator details require verification and membership.">
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }} noValidate>
        {selector}
        <Field label="Full name" id="name"><input id="name" className="input" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email" id="email"><input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password" id="password" help="At least 10 characters."><input id="password" className="input" type="password" required minLength={10} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div>
          <label className="check" htmlFor="terms">
            <input id="terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>I accept the <Link href="/legal/terms" target="_blank">Terms of Use</Link>, including that EXJET is not liable for AOG or anything that happens to the aircraft.</span>
          </label>
        </div>
        <ActionError error={signup.error} />
        <button className="btn btn-primary btn-block" type="submit" disabled={signup.pending || !terms || !name || !email || password.length < 10}>
          {signup.pending ? "Creating account" : "Create account"}
        </button>
        <p className="muted small">Already a member? <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Sign in</Link></p>
      </form>
    </AuthFrame>
  );
}

export default function SignupPage() {
  return <Suspense><SignupInner /></Suspense>;
}
