import { AvinodeWidget } from "./AvinodeWidget";

export function FlightSearchPanel({ group = false, compact = false }: { group?: boolean; compact?: boolean }) {
  return <section className={`ex-search-panel${compact ? " ex-search-panel-compact" : ""}`} aria-label={group ? "Group flight search" : "Flight search"}>
    <AvinodeWidget compact />
  </section>;
}
