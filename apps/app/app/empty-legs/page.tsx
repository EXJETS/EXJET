"use client";

import Link from "next/link";
import { api, type EmptyLeg } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { formatDate } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, EntitlementGate, PageHeader, Rating, type Column } from "@/components/ui";

export default function EmptyLegsPage() {
  const { me } = useMe();
  const q = useApi<EmptyLeg[]>(`empty-legs:${me?.entitled ?? false}`, api.emptyLegs);
  const cols: Column<EmptyLeg>[] = [
    { key: "route", label: "Route", render: (e) => <span className="mono" style={{ fontWeight: 500 }}>{e.origin} – {e.destination}</span> },
    { key: "win", label: "Available", render: (e) => `${formatDate(e.available_from)} to ${formatDate(e.available_to)}` },
    { key: "ac", label: "Aircraft", render: (e) => `${e.listing.type.manufacturer} ${e.listing.type.model}` },
    { key: "seats", label: "Seats", num: true, render: (e) => e.listing.passenger_seats ?? "—" },
    { key: "safety", label: "Safety", render: (e) => <Rating value={e.listing.safety_rating} /> },
    { key: "op", label: "Operator", render: (e) => (e.listing.operator ? <span>{e.listing.operator.dba_name} <span className="mono muted">{e.listing.tail_number}</span></span> : <span className="muted">Members only</span>) },
    {
      key: "go", label: "", hideLabel: true,
      render: (e) => {
        const p = new URLSearchParams({ origin: e.origin, destination: e.destination, date: e.available_from.slice(0, 10), empty_leg: e.id });
        return <Link className="btn btn-sm btn-primary" href={me ? `/request?${p}` : "/login?next=/empty-legs"}>Request via RFQ</Link>;
      },
    },
  ];
  return (
    <>
      <PageHeader title="Empty legs">Repositioning flights that may fit your trip. Empty legs have no listed price. You request them like any other trip and the operator quotes.</PageHeader>
      <div style={{ display: "grid", gap: 16 }}>
        {!me?.entitled ? <EntitlementGate signedIn={!!me} /> : null}
        <Card flush>
          <Async q={q}>
            {(list) => list.length === 0 ? <EmptyState title="No empty legs listed right now">Check back soon, or request a trip and operators will quote it.</EmptyState> : <DataTable caption="Empty legs" columns={cols} rows={list} rowKey={(e) => e.id} />}
          </Async>
        </Card>
      </div>
    </>
  );
}
