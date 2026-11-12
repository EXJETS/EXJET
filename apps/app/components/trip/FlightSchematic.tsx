import type { Leg, TrackLeg } from "@/lib/api";
import { StatusChip } from "../ui";
import { formatWhen } from "@/lib/rules";

const R = 3440.065; // nm
const rad = (x: number) => (x * Math.PI) / 180;
function gc(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Inline-SVG schematic of one leg: origin, destination, arc, and the current position when the track has one. No map tiles, no network. */
export function FlightSchematic({ leg, track }: { leg: Leg; track?: TrackLeg }) {
  const W = 600, H = 130, x0 = 50, x1 = W - 50, y = 84, lift = 52;
  const cx = (x0 + x1) / 2, cy = y - lift * 2;
  const pos = track?.position ?? null;
  const o = { lat: leg.origin.latitude, lon: leg.origin.longitude };
  const d = { lat: leg.destination.latitude, lon: leg.destination.longitude };
  let t: number | null = null;
  if (pos) {
    const a = gc(o, { lat: pos.lat, lon: pos.lon }), b = gc({ lat: pos.lat, lon: pos.lon }, d);
    t = a + b === 0 ? 0 : Math.max(0, Math.min(1, a / (a + b)));
  }
  const bez = (u: number) => ({ x: (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, y: (1 - u) ** 2 * y + 2 * (1 - u) * u * cy + u * u * y });
  const p = t === null ? null : bez(t);
  const ahead = t === null ? null : bez(Math.min(1, t + 0.02));
  const ang = p && ahead ? (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI : 0;
  const label = `Leg ${leg.sequence + 1}: ${leg.origin_icao} to ${leg.destination_icao}, ${track?.status ?? "no status"}${pos ? `, position ${pos.lat.toFixed(2)}, ${pos.lon.toFixed(2)}` : ""}`;
  return (
    <figure style={{ margin: 0, maxWidth: 720 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: "100%", height: "auto", display: "block" }}>
        <path d={`M ${x0} ${y} Q ${cx} ${cy} ${x1} ${y}`} fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="5 5" />
        {t !== null ? <path d={`M ${x0} ${y} Q ${cx} ${cy} ${x1} ${y}`} fill="none" stroke="var(--ink)" strokeWidth="2" pathLength={1} strokeDasharray={`${t} 1`} /> : null}
        <circle cx={x0} cy={y} r="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
        <circle cx={x1} cy={y} r="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
        <text x={x0} y={y + 26} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="700" fill="var(--ink)">{leg.origin_icao}</text>
        <text x={x1} y={y + 26} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="700" fill="var(--ink)">{leg.destination_icao}</text>
        <text x={x0} y={y + 44} textAnchor="middle" fontSize="11" fill="var(--gray)">{leg.origin.city ?? leg.origin.name}</text>
        <text x={x1} y={y + 44} textAnchor="middle" fontSize="11" fill="var(--gray)">{leg.destination.city ?? leg.destination.name}</text>
        {p ? (
          <g transform={`translate(${p.x} ${p.y}) rotate(${ang})`}>
            <path d="M 10 0 L -7 -6 L -3 0 L -7 6 Z" fill="var(--ink)" />
          </g>
        ) : null}
      </svg>
      <figcaption style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: 13 }}>
        <strong>Leg {leg.sequence + 1}</strong>
        <StatusChip status={track?.status ?? "scheduled"} />
        {pos ? (
          <span className="mono muted">{pos.lat.toFixed(3)}, {pos.lon.toFixed(3)} · {pos.altitude_ft?.toLocaleString("en-US") ?? "—"} ft · {pos.groundspeed_kts ?? "—"} kts · {pos.heading ?? "—"}° · {formatWhen(pos.at)}</span>
        ) : <span className="muted">No position yet. It appears once the aircraft is airborne.</span>}
      </figcaption>
    </figure>
  );
}
