"use client";

import { api, type TrackResponse, type Trip, type WeatherResponse } from "@/lib/api";
import { FlightSchematic } from "./FlightSchematic";
import { useApi } from "@/hooks/use-api";
import { Async, Card } from "../ui";


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
            {(t) => (
              <div style={{ display: "grid", gap: 16 }}>
                {trip.legs.map((leg) => <FlightSchematic key={leg.sequence} leg={leg} track={t.legs.find((x) => x.sequence === leg.sequence)} />)}
              </div>
            )}
          </Async>
        </section>
      </div>
    </Card>
  );
}
