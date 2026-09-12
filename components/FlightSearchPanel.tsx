import { AvinodeWidget } from "./AvinodeWidget";

export function FlightSearchPanel({ group = false, compact = false }: { group?: boolean; compact?: boolean }) {
  return <section className={`ex-search-panel${compact ? " ex-search-panel-compact" : ""}`} aria-label={group ? "Group flight search" : "Flight search"}>
    <div className="ex-search-panel-heading"><h2>{group ? "Plan your group flight" : "Find your flight"}</h2><p>Choose your route, dates, and passengers.</p></div>
    <AvinodeWidget compact />
  </section>;
}
