"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Input, PageHeader, SkeletonList } from "@/components/ui";
import { money, plural } from "@/lib/format";
import { filterLegs } from "@/lib/legs";
import { useApp, useHydrated, useLiveLegs } from "@/store/app-store";

export function AlertsScreen() {
  const ready = useHydrated();
  const legs = useLiveLegs();
  const sessionUserId = useApp((s) => s.sessionUserId);
  const alerts = useApp((s) => s.alerts).filter((a) => a.userId === sessionUserId);
  const addAlert = useApp((s) => s.addAlert);
  const removeAlert = useApp((s) => s.removeAlert);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <>
      <PageHeader
        eyebrow="Empty legs"
        title="Route alerts"
        description="We watch new empty legs for you. Matches show up here, and on your phone once notifications are enabled in the app."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!from.trim() && !to.trim()) return;
          addAlert({ from: from.trim(), to: to.trim() });
          setFrom("");
          setTo("");
        }}
        className="mt-8 grid gap-2 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From (city or code)" aria-label="From" />
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To (city or code)" aria-label="To" />
        <Button type="submit" disabled={!from.trim() && !to.trim()}>
          <Plus className="h-4 w-4" /> Add alert
        </Button>
      </form>
      {!sessionUserId && ready && (
        <p className="mt-3 text-[13px] text-muted">
          Alerts are saved on this device. <Link href="/account/?next=/alerts/" className="text-ink underline">Sign in</Link> to keep them with your account.
        </p>
      )}

      <div className="mt-6">
        {!ready ? (
          <SkeletonList count={2} />
        ) : alerts.length === 0 ? (
          <EmptyState icon={<Bell className="h-5 w-5" />} title="No alerts yet" body="Add a route above, or tap “Alert me” on any empty-leg search." />
        ) : (
          <ul className="space-y-3">
            {alerts.map((a) => {
              const matches = filterLegs(legs, { from: a.from, to: a.to, maxPrice: a.maxPrice });
              const q = new URLSearchParams();
              if (a.from) q.set("from", a.from);
              if (a.to) q.set("to", a.to);
              if (a.maxPrice) q.set("max", String(a.maxPrice));
              return (
                <li key={a.id}>
                  <Card className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-medium">
                        {a.from || "Anywhere"} → {a.to || "Anywhere"}
                      </p>
                      <p className="text-[13px] text-muted">
                        {a.maxPrice ? `Under ${money(a.maxPrice)} · ` : ""}
                        {matches.length
                          ? `${plural(matches.length, "match", "matches")} from ${money(Math.min(...matches.map((m) => m.leg.price)))}`
                          : "Watching — no matches yet"}
                      </p>
                    </div>
                    {matches.length > 0 && (
                      <Link href={`/empty-legs/?${q}`} className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white">
                        View
                      </Link>
                    )}
                    <button
                      type="button"
                      aria-label="Delete alert"
                      onClick={() => removeAlert(a.id)}
                      className="rounded-full p-2 text-subtle hover:bg-black/5 hover:text-ink"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
