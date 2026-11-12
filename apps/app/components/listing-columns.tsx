import { Lock } from "lucide-react";
import type { Listing } from "@/lib/api";
import { Rating, type Column } from "./ui";

const Locked = () => <span className="muted" title="Members only"><Lock size={12} aria-hidden /> Members only</span>;

/** Column set for anonymized/entitled listing tables. Operator and tail render a lock when the API returns null. */
export function listingColumns(entitled: boolean): Column<Listing>[] {
  const cols: Column<Listing>[] = [
    { key: "type", label: "Aircraft", render: (l) => <span style={{ fontWeight: 500 }}>{l.type.manufacturer} {l.type.model}</span> },
  ];
  if (entitled) {
    cols.push(
      { key: "tail", label: "Tail", render: (l) => (l.tail_number ? <span className="mono">{l.tail_number}</span> : <Locked />) },
      { key: "op", label: "Operator", render: (l) => (l.operator ? l.operator.dba_name : <Locked />) },
    );
  } else {
    cols.push({ key: "lock", label: "Operator and tail", render: () => <Locked /> });
  }
  cols.push(
    { key: "yr", label: "Year", render: (l) => <span className="mono">{l.year_of_manufacture ?? "—"}{l.year_refurbished ? ` / ${l.year_refurbished}` : ""}</span> },
    { key: "seats", label: "Seats", num: true, render: (l) => l.passenger_seats ?? "—" },
    { key: "home", label: "Home", render: (l) => l.home_city ?? "—" },
    { key: "safety", label: "Safety", render: (l) => <Rating value={l.safety_rating} /> },
    { key: "am", label: "Amenities", render: (l) => (l.amenities.length ? l.amenities.join(", ") : <span className="muted">—</span>) },
  );
  return cols;
}
