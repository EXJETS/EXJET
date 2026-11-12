"use client";

import Link from "next/link";
import { api, type Trip } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatLegDeparture, nextAction, tripTitle } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, PageHeader, StatusChip, type Column } from "@/components/ui";

export default function TripsPage() {
  const q = useApi<Trip[]>("trips", api.trips);
  const cols: Column<Trip>[] = [
    { key: "route", label: "Route", render: (t) => <Link className="rowlink mono" href={`/trips/${t.id}`}>{tripTitle(t)}</Link> },
    { key: "dep", label: "Departs", render: (t) => t.legs[0] ? formatLegDeparture(t.legs[0]) : "—" },
    { key: "pax", label: "Pax", num: true, render: (t) => t.passengers },
    { key: "status", label: "Status", render: (t) => <StatusChip status={t.status} /> },
    { key: "next", label: "Next action", render: (t) => <span>{nextAction(t)}</span> },
    { key: "go", label: "", hideLabel: true, render: (t) => <Link className="btn btn-sm" href={`/trips/${t.id}`}>Open</Link> },
  ];
  return (
    <>
      <PageHeader title="Trips" actions={<Link className="btn btn-primary" href="/request">New trip</Link>}>Every trip with its status and the next thing to do.</PageHeader>
      <Card flush>
        <Async q={q}>
          {(trips) => trips.length === 0 ? (
            <EmptyState title="No trips yet" action={<Link className="btn btn-primary" href="/request">Request a trip</Link>}>Start with a route and date. You will see matching aircraft before anything is sent.</EmptyState>
          ) : (
            <DataTable caption="Your trips" columns={cols} rows={trips} rowKey={(t) => t.id} />
          )}
        </Async>
      </Card>
    </>
  );
}
