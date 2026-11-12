"use client";

import { api, type TrackResponse, type Trip, type WeatherResponse } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatWhen } from "@/lib/rules";
import { Async, Card, DataTable, EmptyState, StatusChip, type Column } from "../ui";

type Row = { leg: number; route: string; status: string; pos: NonNullable<TrackResponse["legs"][number]["position"]> | null };

export function FlightSection({ trip, locked }: { trip: Trip; locked: boolean }) {
  const active = !locked;
  const weather = useApi<WeatherResponse>(active && trip.weather_available ? `wx:${trip.id}` : null, () => api.weather(trip.id), { refreshMs: 300_000 });
  const track = useApi<TrackResponse>(active ? `track:${trip.id}:${trip.status}` : null, () => api.track(trip.id), { refreshMs: 20_000, poll: () => trip.status === "in_flight" });

  if (locked) {
    return (
      <Card id="flight" num="08" title="Flight">
        <p className="muted">Weather and live status appear once the manifest is submitted.</p>
      </Card>
    );
  }
  return (
    <Card id="flight" num="08" title="Flight">
      <div style={{ display: "grid", gap: 24 }}>
        <section aria-labelledby="wx-h">
          <h3 id="wx-h" style={{ marginBottom: 8 }}>Weather</h3>
          {!trip.weather_available ? <p className="muted">Weather is not available for this trip yet.</p> : (
            <Async q={weather}>
              {(w) => (
                <div style={{ display: "grid", gap: 16 }}>
                  {w.legs.map((leg, i) => (
                    <div key={i} className="card">
                      <div className="card-h"><strong>Leg {i + 1} <span className="mono">{trip.legs[i]?.origin_icao} – {trip.legs[i]?.destination_icao}</span></strong></div>
                      <div className="card-b" style={{ display: "grid", gap: 12 }}>
                        {leg.summary ? <p>{leg.summary}</p> : null}
                        <div className="grid2">
                          {([["Origin", leg.origin.icao, leg.origin], ["Destination", leg.destination.icao, leg.destination]] as const).map(([l, icao, w2]) => (
                            <div key={l} style={{ display: "grid", gap: 6 }}>
                              <div className="eyebrow">{l} {icao}</div>
                              <div className="small muted">METAR</div><pre className="raw">{w2.metar ?? "No report"}</pre>
                              <div className="small muted">TAF</div><pre className="raw">{w2.taf ?? "No forecast"}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Async>
          )}
        </section>
        <section aria-labelledby="tk-h">
          <h3 id="tk-h" style={{ marginBottom: 8 }}>Live status</h3>
          <Async q={track}>
            {(t) => {
              const rows: Row[] = t.legs.map((l, i) => ({ leg: i, route: `${trip.legs[i]?.origin_icao ?? ""} – ${trip.legs[i]?.destination_icao ?? ""}`, status: l.status, pos: l.position }));
              const cols: Column<Row>[] = [
                { key: "leg", label: "Leg", render: (r) => <span><span className="mono">{r.leg + 1}</span> <span className="mono muted">{r.route}</span></span> },
                { key: "st", label: "Status", render: (r) => <StatusChip status={r.status} /> },
                { key: "lat", label: "Latitude", num: true, render: (r) => <span className="mono">{r.pos ? r.pos.lat.toFixed(4) : "—"}</span> },
                { key: "lon", label: "Longitude", num: true, render: (r) => <span className="mono">{r.pos ? r.pos.lon.toFixed(4) : "—"}</span> },
                { key: "alt", label: "Altitude (ft)", num: true, render: (r) => <span className="mono">{r.pos?.altitude_ft?.toLocaleString("en-US") ?? "—"}</span> },
                { key: "gs", label: "Groundspeed (kts)", num: true, render: (r) => <span className="mono">{r.pos?.groundspeed_kts ?? "—"}</span> },
                { key: "hdg", label: "Heading", num: true, render: (r) => <span className="mono">{r.pos?.heading !== null && r.pos?.heading !== undefined ? `${r.pos.heading}°` : "—"}</span> },
                { key: "at", label: "Position time", render: (r) => formatWhen(r.pos?.at) },
              ];
              return rows.length ? <div className="card"><DataTable caption="Live track per leg" columns={cols} rows={rows} rowKey={(r) => String(r.leg)} /></div> : <EmptyState title="No tracking data yet" />;
            }}
          </Async>
        </section>
      </div>
    </Card>
  );
}
