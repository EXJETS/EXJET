"use client";

import Image from "next/image";
import { useState } from "react";
import type { AircraftFloorplan } from "@/data/aircraft-reference";

export function AircraftFloorplans({ name, layouts }: { name: string; layouts: AircraftFloorplan[] }) {
  const [selected, setSelected] = useState(0);
  const layout = layouts[selected] ?? layouts[0];
  if (!layout) return null;

  return <figure id="cabin-layout" className="aircraft-reference__floorplan">
    <h3>Room for your routine.</h3>
    {layouts.length > 1 ? <div className="aircraft-reference__layout-options" role="group" aria-label={`${name} cabin layouts`}>
      {layouts.map((item, index) => <button type="button" key={item.src} aria-pressed={index === selected} aria-controls="cabin-layout-image" onClick={() => setSelected(index)}>{item.label}</button>)}
    </div> : null}
    <div id="cabin-layout-image" className={`aircraft-reference__layout-image${layout.height > layout.width ? " aircraft-reference__layout-image--portrait" : ""}`}>
      <Image key={layout.src} src={layout.src} width={layout.width} height={layout.height} alt={`${name} — ${layout.label.toLowerCase()} cabin floor plan`} sizes="(max-width:760px) 90vw, 1100px" />
    </div>
    <figcaption><span aria-live="polite">{layout.label}.</span> Seating, sleeping arrangements and amenities vary by individual aircraft.</figcaption>
    <a className="ex-inline-link" href={layout.src} target="_blank" rel="noopener noreferrer">View full-size floor plan <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
  </figure>;
}
