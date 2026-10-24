import Image from "next/image";
import references from "@/data/aircraft-reference.json";

export function AircraftReference({ slug }: { slug: string }) {
  const reference = references[slug as keyof typeof references];
  if (!reference) return null;
  const floorplan = "floorplan" in reference ? reference.floorplan : null;
  return <section className="aircraft-reference section">
    <div className="shell">
      <p className="eyebrow">Performance & design</p>
      <h2>The details that shape your journey.</h2>
      <dl className="aircraft-reference__metrics">{reference.metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="aircraft-reference__tables">
        {[{ title: "Cabin dimensions", rows: reference.cabin }, { title: "Performance reference", rows: reference.performance }].map(group => <div key={group.title}><h3>{group.title}</h3><dl>{group.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>)}
      </div>
      {floorplan ? <figure className="aircraft-reference__floorplan">
        <h3>Room for your routine.</h3>
        <Image src={floorplan.src} width={floorplan.width} height={floorplan.height} alt={`Representative ${reference.name} cabin floor plan`} sizes="(max-width:760px) 100vw, 1200px" />
        <figcaption>Representative cabin layout. Seating, sleeping arrangements and amenities vary by individual aircraft.</figcaption>
        <a className="ex-inline-link" href={floorplan.src} target="_blank" rel="noopener noreferrer">View full-size floor plan ↗</a>
      </figure> : null}
      <details className="aircraft-reference__notes"><summary>Specifications & operating assumptions</summary><p>{reference.note}</p><a href={reference.source} target="_blank" rel="noopener noreferrer">Technical reference ↗</a></details>
    </div>
  </section>;
}
