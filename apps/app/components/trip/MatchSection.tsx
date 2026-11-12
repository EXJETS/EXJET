"use client";

import { useState } from "react";
import { api, type Listing, type MatchResult, type Trip } from "@/lib/api";
import { useAction, useApi } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { formatDuration } from "@/lib/rules";
import { ActionError, Async, Card, Chip, DataTable, EmptyState, EntitlementGate, TableSkeleton } from "../ui";
import { listingColumns } from "../listing-columns";

const CAT_NAME: Record<string, string> = {
  light: "Light jets", midsize: "Midsize jets", super_midsize: "Super midsize jets", large: "Large jets", ultra_long_range: "Ultra long range jets",
};
const catName = (c: string) => CAT_NAME[c] ?? c.replace(/_/g, " ").replace(/^\w/, (x) => x.toUpperCase());

export function reasonText(r: string): string {
  if (r === "passengers_exceed_capacity") return "Too many passengers";
  if (r === "baggage_exceeds_capacity") return "Baggage exceeds capacity";
  if (r === "range_exceeded") return "Range exceeded (more than one fuel stop)";
  if (r === "airport_data_missing" || r === "distance_unknown") return "Airport data missing";
  if (r.startsWith("runway_too_short_")) return `Runway too short at ${r.slice(17)}`;
  return r.replace(/_/g, " ");
}

export function MatchSection({ trip, onSent }: { trip: Trip; onSent: () => void }) {
  const { me } = useMe();
  const entitled = !!me?.entitled;
  const match = useApi<MatchResult>(`match:${trip.id}:${trip.passengers}`, () => api.match(trip.id));
  const [slug, setSlug] = useState<string | null>(null);

  return (
    <Card id="aircraft" num="02" title="Aircraft" flush>
      <Async q={match}>
        {(m) => (
          <>
            {m.categories.length === 0 ? (
              <EmptyState title="No aircraft type fits this mission">
                Try fewer passengers or bags, or a different route. Types with missing range or runway data are never offered.
              </EmptyState>
            ) : (
              m.categories.map((c) => (
                <div className="cat" key={c.category}>
                  <div className="cat-h">{catName(c.category)}</div>
                  {c.types.map((t) => (
                    <button key={t.slug} className="typerow" aria-pressed={slug === t.slug} onClick={() => setSlug(t.slug)}>
                      <span style={{ fontWeight: 500 }}>{t.model}</span>
                      <span>
                        {t.stops === 0 ? <Chip tone="ok" plain>Nonstop</Chip> : <Chip tone="wait" plain>1 fuel stop{t.fuel_stop_icao ? ` · ${t.fuel_stop_icao}` : ""}</Chip>}
                      </span>
                      <span className="num">{formatDuration(t.flight_time_minutes)}</span>
                      <span className="num">{t.listing_count} {t.listing_count === 1 ? "aircraft" : "aircraft"}</span>
                      <span aria-hidden>›</span>
                    </button>
                  ))}
                </div>
              ))
            )}
            {m.rejected.length > 0 ? (
              <details className="report" style={{ padding: "8px 16px", borderTop: "1px solid var(--line)" }}>
                <summary>Not offered for this mission ({m.rejected.length})</summary>
                <ul className="ul-plain" style={{ marginTop: 8 }}>
                  {m.rejected.map((r) => (
                    <li key={r.slug}><span className="mono">{r.slug}</span><span className="muted small">{r.reasons.map(reasonText).join("; ")}</span></li>
                  ))}
                </ul>
              </details>
            ) : null}
            {slug ? <ListingsPicker trip={trip} slug={slug} entitled={entitled} onSent={onSent} /> : (
              m.categories.length > 0 ? <p className="muted small" style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>Select an aircraft type to see matching aircraft.</p> : null
            )}
          </>
        )}
      </Async>
    </Card>
  );
}

function ListingsPicker({ trip, slug, entitled, onSent }: { trip: Trip; slug: string; entitled: boolean; onSent: () => void }) {
  const q = useApi<Listing[]>(`listings:${trip.id}:${slug}:${entitled}`, () => api.tripListings(trip.id, slug));
  const [sel, setSel] = useState<Set<string>>(new Set());
  const send = useAction(api.sendRfqs);
  const already = new Set(trip.rfqs.map((r) => r.listing?.listing_id).filter(Boolean) as string[]);
  const canSend = ["draft", "rfq_sent", "quoted"].includes(trip.status);

  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  async function go() {
    const r = await send.run(trip.id, [...sel]);
    if (r) {
      setSel(new Set());
      onSent();
    }
  }

  const cols = listingColumns(entitled);

  return (
    <div style={{ borderTop: "1px solid var(--line-strong)" }}>
      {!entitled ? <div className="card-b"><EntitlementGate /></div> : null}
      <Async q={q} skeleton={<TableSkeleton rows={3} />}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="No aircraft of this type are available for the mission">Try another type.</EmptyState>
          ) : (
            <>
              <DataTable
                caption="Matching aircraft"
                columns={entitled ? [...cols, { key: "st", label: "RFQ", render: (l) => (already.has(l.listing_id) ? <Chip tone="wait">RFQ sent</Chip> : <span className="muted">—</span>) }] : cols}
                rows={list}
                rowKey={(l) => l.listing_id}
                selectable={entitled && canSend}
                selected={sel}
                onToggle={(id) => !already.has(id) && toggle(id)}
                selectLabel={(l) => `Select ${l.type.model} ${l.tail_number ?? ""}`}
              />
              {entitled && canSend ? (
                <div className="sticky-bar" style={{ margin: 12 }}>
                  <span aria-live="polite"><strong>{sel.size}</strong> selected. RFQs go to the operators of the selected aircraft. No price is committed.</span>
                  <button className="btn btn-primary" disabled={sel.size === 0 || send.pending} onClick={go}>{send.pending ? "Sending" : `Send RFQ${sel.size > 1 ? `s (${sel.size})` : ""}`}</button>
                </div>
              ) : null}
              <div style={{ padding: "0 12px 12px" }}><ActionError error={send.error} /></div>
            </>
          )
        }
      </Async>
    </div>
  );
}
