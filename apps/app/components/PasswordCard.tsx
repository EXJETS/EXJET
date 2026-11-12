"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-api";
import { ActionError, Banner, Card, Field } from "./ui";

export function PasswordCard() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [done, setDone] = useState(false);
  const change = useAction(api.changePassword);
  return (
    <Card title="Password">
      <form style={{ display: "grid", gap: 12, maxWidth: 420 }} onSubmit={async (e) => {
        e.preventDefault();
        const r = await change.run(cur, next);
        if (r !== undefined) { setDone(true); setCur(""); setNext(""); }
      }}>
        <Field label="Current password" id="cur-pw"><input id="cur-pw" className="input" type="password" autoComplete="current-password" required value={cur} onChange={(e) => { setCur(e.target.value); setDone(false); }} /></Field>
        <Field label="New password" id="new-pw" help="At least 10 characters. Other sessions are signed out."><input id="new-pw" className="input" type="password" autoComplete="new-password" required minLength={10} value={next} onChange={(e) => { setNext(e.target.value); setDone(false); }} /></Field>
        <ActionError error={change.error} />
        {done ? <Banner tone="ok" live>Password changed. Other sessions were signed out.</Banner> : null}
        <div><button className="btn" disabled={change.pending || !cur || next.length < 10}>{change.pending ? "Saving" : "Change password"}</button></div>
      </form>
    </Card>
  );
}
