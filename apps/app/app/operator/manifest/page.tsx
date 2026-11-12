"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { api, type OperatorManifest } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatDate, formatWhen } from "@/lib/rules";

const idLabel = (t: string) => (t === "passport" ? "Passport" : "REAL ID");

function Inner() {
  const token = useSearchParams().get("token");
  const q = useApi<OperatorManifest>(token ? `op-manifest:${token.slice(0, 12)}` : null, () => api.operatorManifest(token as string));
  const invalid = !token || (q.error && (q.error.status === 404 || q.error.code === "invalid_link"));

  return (
    <div className="opm">
      <header className="opm-h">
        <Image src="/brand/exjet-wordmark.svg" alt="EXJET" width={96} height={26} unoptimized />
        <button className="btn btn-sm opm-print" onClick={() => window.print()}>Print</button>
      </header>
      {invalid ? (
        <main className="opm-b" id="main">
          <h1>This link is invalid or has expired</h1>
          <p className="muted">Ask EXJET for a new secure manifest link.</p>
        </main>
      ) : q.error ? (
        <main className="opm-b" id="main" role="alert">
          <h1>The manifest could not be loaded</h1>
          <p className="muted">{q.error.status === 429 ? "Too many requests. Wait a minute and reload." : "Reload the page to try again."}</p>
        </main>
      ) : !q.data ? (
        <main className="opm-b" id="main" role="status"><p className="muted">Loading manifest</p></main>
      ) : (
        <main className="opm-b" id="main">
          <h1>Passenger manifest</h1>
          <dl className="kv" style={{ marginTop: 12 }}>
            <dt>Trip reference</dt><dd className="mono" style={{ fontWeight: 700 }}>{q.data.trip_reference}</dd>
            <dt>Submitted</dt><dd>{formatWhen(q.data.submitted_at)}</dd>
            <dt>Passengers</dt><dd>{q.data.passengers.length} of {q.data.expected_passengers}</dd>
          </dl>
          <h2 style={{ margin: "20px 0 8px" }}>Route</h2>
          <table className="opm-t">
            <thead><tr><th>Leg</th><th>From</th><th>To</th><th>Departure (local)</th></tr></thead>
            <tbody>
              {q.data.legs.map((l) => (
                <tr key={l.sequence}>
                  <td>{l.sequence + 1}</td>
                  <td className="mono">{l.origin_icao}</td>
                  <td className="mono">{l.destination_icao}</td>
                  <td>{l.depart_local ? formatWhen(l.depart_local) : "—"}{l.origin_timezone ? <span className="muted small"> {l.origin_timezone}</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 style={{ margin: "20px 0 8px" }}>Passengers</h2>
          <table className="opm-t">
            <thead><tr><th>#</th><th>Name</th><th>Date of birth</th><th>ID type</th><th>ID number</th><th>Expiry</th><th>Issuer</th><th>Weight (lb)</th></tr></thead>
            <tbody>
              {q.data.passengers.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                  <td>{formatDate(p.date_of_birth)}</td>
                  <td>{idLabel(p.id_type)}</td>
                  <td className="mono">{p.id_number}</td>
                  <td>{formatDate(p.id_expiry)}</td>
                  <td>{p.id_issuer ?? "—"}</td>
                  <td>{p.weight_lbs ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small" style={{ marginTop: 20 }}>
            Access to this page is logged. This link expires {formatWhen(q.data.expires_at)} and may stop working earlier if the manifest changes. Passenger details are shared for this flight only.
          </p>
        </main>
      )}
    </div>
  );
}

export default function OperatorManifestPage() {
  return <Suspense><Inner /></Suspense>;
}
