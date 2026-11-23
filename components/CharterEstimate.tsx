"use client";

import { useEffect, useId, useState } from "react";
import styles from "./CharterEstimate.module.css";

type Endpoint = { code: string; label: string; lat: number; lon: number };
type Segment = { from: Endpoint; to: Endpoint };
type Estimate = { estimateUsd: number | null; segments: Segment[] };
type EstimateLeg = { departure: string; destination: string; departureIcao: string; destinationIcao: string; date: string; time: string };

function isEndpoint(value: unknown): value is Endpoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<Endpoint>;
  return typeof point.code === "string" && typeof point.label === "string" &&
    typeof point.lat === "number" && Math.abs(point.lat) <= 90 &&
    typeof point.lon === "number" && Math.abs(point.lon) <= 180;
}

function parseEstimate(body: unknown): Estimate | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<Estimate> & { currency?: string };
  if (value.currency !== "USD" || !Array.isArray(value.segments)) return null;
  return {
    estimateUsd: typeof value.estimateUsd === "number" && Number.isFinite(value.estimateUsd) && value.estimateUsd > 0 ? value.estimateUsd : null,
    segments: value.segments.filter(segment => segment && isEndpoint(segment.from) && isEndpoint(segment.to)),
  };
}

const shortestLongitude = (delta: number) => ((delta + 180) % 360 + 360) % 360 - 180;

function RouteMap({ segments }: { segments: Segment[] }) {
  const title = useId();
  const routes: [Endpoint & { plotLon: number }, Endpoint & { plotLon: number }][] = [];
  for (const { from, to } of segments) {
    const previousLongitude = routes.at(-1)?.[1].plotLon ?? from.lon;
    const fromLon = previousLongitude + shortestLongitude(from.lon - previousLongitude);
    const toLon = fromLon + shortestLongitude(to.lon - fromLon);
    routes.push([{ ...from, plotLon: fromLon }, { ...to, plotLon: toLon }]);
  }
  const points = routes.flat();
  const minX = Math.min(...points.map(point => point.plotLon));
  const maxX = Math.max(...points.map(point => point.plotLon));
  const minY = Math.min(...points.map(point => point.lat));
  const maxY = Math.max(...points.map(point => point.lat));
  const longitudeFactor = Math.max(0.2, Math.cos((minY + maxY) * Math.PI / 360));
  const scale = Math.min(368 / Math.max(1, (maxX - minX) * longitudeFactor), 84 / Math.max(1, maxY - minY));
  const x = (lon: number) => 208 + (lon - (minX + maxX) / 2) * scale * longitudeFactor;
  const y = (lat: number) => 64 - (lat - (minY + maxY) / 2) * scale;
  return <figure className={styles.map}>
    <svg viewBox="0 0 416 128" role="img" aria-labelledby={title}>
      <title id={title}>{segments.map(({ from, to }) => `${from.label || from.code} to ${to.label || to.code}`).join("; ")}</title>
      {[-2,-1,0,1,2].map(world => <image key={world} href="/brand/charter-land-outline.svg" x={x(-180 + world * 360)} y={y(90)} width={360 * scale * longitudeFactor} height={180 * scale} preserveAspectRatio="none" />)}
      {[52,104,156,208,260,312,364].map(gridX => <path key={gridX} className={styles.grid} d={`M${gridX} 0V128`} />)}
      {[32,64,96].map(gridY => <path key={gridY} className={styles.grid} d={`M0 ${gridY}H416`} />)}
      {routes.map(([from,to], index) => <line key={index} className={styles.route} x1={x(from.plotLon)} y1={y(from.lat)} x2={x(to.plotLon)} y2={y(to.lat)} />)}
      {points.map((point,index) => <circle key={index} className={styles.airport} cx={x(point.plotLon)} cy={y(point.lat)} r="4.5" />)}
    </svg>
    <figcaption>Illustrative route map · Not a flight path · Made with Natural Earth</figcaption>
  </figure>;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function CharterEstimate({ legs, passengers, aircraftCategory }: { legs: EstimateLeg[]; passengers: number; aircraftCategory?: string }) {
  const title = useId();
  const request = JSON.stringify({ legs, passengers, aircraftCategory });
  const [result, setResult] = useState<{ request: string; estimate: Estimate | null } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let expired = false;
    const timeout = window.setTimeout(() => {
      expired = true;
      controller.abort();
      setResult({ request, estimate: null });
    }, 8000);
    fetch("/api/charter-estimate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: request,
      signal: controller.signal,
    }).then(async response => response.ok ? parseEstimate(await response.json()) : null)
      .then(estimate => { if (!controller.signal.aborted) setResult({ request, estimate }); })
      .catch(() => { if (!controller.signal.aborted && !expired) setResult({ request, estimate: null }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [request]);

  const loaded = result?.request === request;
  const estimate = loaded ? result.estimate : null;
  const amount = estimate?.estimateUsd;
  const mapped = estimate?.segments.length === legs.length ? estimate.segments : [];
  return <section className={styles.estimate} aria-labelledby={title}>
    <div className={styles.heading}>
      <h3 id={title}>Estimated flight total</h3>
      <div role="status" aria-live="polite">
        {!loaded ? <p>Checking your route…</p> : amount ? <strong>{usd.format(amount)} USD</strong> : <p>Contact us for a quote on this itinerary.</p>}
      </div>
      {amount ? <small>Excludes taxes and additional charges. This is an estimate, not a confirmed quote or aircraft availability.</small> : null}
    </div>
    {mapped.length ? <RouteMap segments={mapped} /> : null}
  </section>;
}
