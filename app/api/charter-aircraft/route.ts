import photoSources from "@/PHOTO-SOURCES.json";
import { fleetCategoryLabel, matchFleet, type FleetCategory, type FleetRecord } from "@/lib/charter-fleet";
import { isFloatingFleetEnabled, publishedCharterFleet } from "@/lib/charter-catalog.server";
import { getDirectoryAircraft, getModelSpecification, isRequestOnly } from "@/data/aircraft-directory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function modelCard(modelSlug: string, category: FleetCategory) {
  const model = getModelSpecification(modelSlug);
  const profile = getDirectoryAircraft(modelSlug);
  if (!model || !profile || isRequestOnly(model)) return null;
  return {
    modelSlug, name: model.name, category, categoryLabel: fleetCategoryLabel(category),
    image: profile.image ?? null, fit: profile.cardFit ?? "cover",
  };
}
const exactPhotos = new Map(
  photoSources.assets.flatMap(asset => asset.source_kind === "jet-ten-exact-tail" && "tail" in asset &&
    typeof asset.tail === "string" ? [[asset.tail, { file: asset.file, formerRegistration: "former_registration" in asset ? asset.former_registration : undefined }] as const] : []),
);

function listedCard(record: FleetRecord) {
  const model = modelCard(record.modelSlug, record.category);
  if (!model) return null;
  const exactPhoto = record.id === `jet-ten-${record.tail.toLowerCase()}` ? exactPhotos.get(record.tail) : undefined;
  return {
    ...model, id: record.id, tail: record.tail, seats: record.seats,
    ...(exactPhoto ? { image: exactPhoto.file, fit: "contain", photoCredit: "Jet-Ten", photoFormerRegistration: exactPhoto.formerRegistration } : {}),
  };
}

export function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const airport = query.get("airport") ?? "";
  const passengers = Number(query.get("passengers"));
  const headers = { "Cache-Control": "private, no-store" };
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 16) {
    return Response.json({ error: "Choose between 1 and 16 passengers." }, { status: 400, headers });
  }
  const matches = matchFleet(publishedCharterFleet(), airport, passengers, isFloatingFleetEnabled());
  const floating = matches.floating.flatMap(row => listedCard(row) ?? []).slice(0, 60);
  const based = matches.based.flatMap(row => listedCard(row) ?? []).slice(0, 60);
  return Response.json({ floating, based }, { headers });
}
