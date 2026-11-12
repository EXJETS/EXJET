"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api, type AircraftType, type Category, type Listing } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useMe } from "@/hooks/me";
import { Async, Card, DataTable, EmptyState, EntitlementGate, PageHeader, TableSkeleton, type Column } from "@/components/ui";
import { listingColumns } from "@/components/listing-columns";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const { me } = useMe();
  const category = params.get("category");
  const type = params.get("type");

  const cats = useApi<Category[]>("cats", api.categories);
  const types = useApi<AircraftType[]>(`types:${category ?? ""}`, () => api.aircraftTypes(category ?? undefined));
  const listings = useApi<Listing[]>(type ? `ls:${type}:${me?.entitled ?? false}` : null, () => api.listings({ type_slug: type ?? undefined }));

  const go = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) (v ? p.set(k, v) : p.delete(k));
    router.replace(`${path}${p.toString() ? `?${p}` : ""}`, { scroll: false });
  };

  const typeCols: Column<AircraftType>[] = [
    { key: "m", label: "Type", render: (t) => <button className="link-btn" onClick={() => go({ type: t.slug })} aria-pressed={type === t.slug}>{t.manufacturer} {t.model}</button> },
    { key: "c", label: "Category", render: (t) => t.category.replace(/_/g, " ") },
    { key: "p", label: "Max pax", num: true, render: (t) => t.max_passengers ?? "—" },
    { key: "r", label: "Range (nm)", num: true, render: (t) => t.range_nm?.toLocaleString("en-US") ?? "—" },
    { key: "s", label: "Cruise (kts)", num: true, render: (t) => t.cruise_speed_kts ?? "—" },
    { key: "b", label: "", hideLabel: true, render: (t) => <button className="btn btn-sm" onClick={() => go({ type: t.slug })}>Show aircraft</button> },
  ];

  return (
    <>
      <PageHeader title="Aircraft">Browse categories, types and anonymized aircraft. Operator and tail number are shown to verified members. No prices are listed; every trip is a request for quote.</PageHeader>
      <div style={{ display: "grid", gap: 16 }}>
        <Async q={cats} skeleton={<div className="skeleton" style={{ height: 36 }} />}>
          {(list) => (
            <div role="group" aria-label="Category" className="seg" style={{ flexWrap: "wrap", width: "fit-content", maxWidth: "100%" }}>
              <button aria-pressed={!category} onClick={() => go({ category: null, type: null })}>All</button>
              {list.map((c) => (
                <button key={c.category} aria-pressed={category === c.category} onClick={() => go({ category: c.category, type: null })}>{c.name} ({c.type_count})</button>
              ))}
            </div>
          )}
        </Async>
        <Card title="Aircraft types" flush>
          <Async q={types}>
            {(list) => list.length === 0 ? <EmptyState title="No aircraft types in this category" /> : <DataTable caption="Aircraft types" columns={typeCols} rows={list} rowKey={(t) => t.slug} />}
          </Async>
        </Card>
        {type ? (
          <Card title={`Aircraft: ${types.data?.find((t) => t.slug === type)?.model ?? type}`} flush>
            {!me?.entitled ? <div className="card-b"><EntitlementGate signedIn={!!me} /></div> : null}
            <Async q={listings} skeleton={<TableSkeleton rows={3} />}>
              {(list) => list.length === 0 ? <EmptyState title="No aircraft listed for this type" /> : <DataTable caption="Aircraft listings" columns={listingColumns(!!me?.entitled)} rows={list} rowKey={(l) => l.listing_id} />}
            </Async>
          </Card>
        ) : null}
      </div>
    </>
  );
}

export default function AircraftPage() {
  return <Suspense><Inner /></Suspense>;
}
