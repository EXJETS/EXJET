import { getAircraftReference } from "@/data/aircraft-reference";
import { AircraftFloorplans } from "./AircraftFloorplans";

export function AircraftReference({ slug }: { slug: string }) {
  const reference = getAircraftReference(slug);
  if (!reference) return null;
  return <section id="aircraft-specifications" className="aircraft-reference section" aria-labelledby="aircraft-specifications-title">
    <div className="shell">
      <p className="eyebrow">Performance & design</p>
      <h2 id="aircraft-specifications-title">The details that shape your journey.</h2>
      <dl className="aircraft-reference__metrics">{reference.metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="aircraft-reference__tables">
        {[{ title: "Cabin dimensions", rows: reference.cabin }, { title: "Performance reference", rows: reference.performance }].map(group => <div key={group.title}><h3>{group.title}</h3><dl>{group.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>)}
      </div>
      {reference.floorplans?.length ? <AircraftFloorplans key={slug} name={reference.name} layouts={reference.floorplans} /> : null}
      <details className="aircraft-reference__notes"><summary>Specifications & operating assumptions</summary><p>{reference.note}</p><a href={reference.source} target="_blank" rel="noopener noreferrer">Technical reference ↗</a></details>
    </div>
  </section>;
}
