import "server-only";
import approved from "@/data/charter-faa-approved.json";
import bases from "@/data/charter-home-bases.json";
import { parseFleetCatalog, type FleetRecord } from "@/lib/charter-fleet";

const eligible = new Set(approved.map(row => `${row[0]}:${row[1]}`));

let cache: FleetRecord[] | undefined;
export function publishedCharterFleet() {
  if (cache) return cache;
  let configured: unknown = [];
  try { configured = JSON.parse(process.env.EXJET_PUBLISHED_FLEET || "[]"); } catch { /* An invalid override cannot erase verified bases. */ }
  const all = Array.isArray(configured) ? [...configured, ...bases] : bases;
  cache = parseFleetCatalog(all).filter(row => eligible.has(`${row.tail}:${row.modelSlug}`));
  return cache;
}

export function isFloatingFleetEnabled() {
  return process.env.EXJET_FLOATING_FLEET_ENABLED === "true";
}
