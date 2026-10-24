import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, "PHOTO-SOURCES.json"), "utf8"));
const approved = new Map(manifest.assets.map(asset => [asset.file, asset]));
const errors = [];
const references = JSON.parse(await readFile(path.join(root, "data/aircraft-reference.json"), "utf8"));
for (const reference of Object.values(references)) {
  for (const layout of reference.floorplans ?? []) {
    const asset = approved.get(layout.src);
    if (!asset || asset.model !== reference.name || asset.scene !== "floorplan") {
      errors.push(`Floor plan does not match its aircraft model: ${reference.name} — ${layout.src}`);
    } else if (asset.dimensions.width !== layout.width || asset.dimensions.height !== layout.height) {
      errors.push(`Floor plan dimensions differ from the source record: ${layout.src}`);
    }
  }
}
// Owner's source restriction: only the four supplied manufacturer websites.
// No uploader, press-distributor, dealership or archival republication exceptions.
const manufacturerHosts = ["bombardier.com", "cessna.txtav.com", "dassaultfalcon.com", "embraer.com"];
function isManufacturerUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && manufacturerHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch { return false; }
}

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await checkDirectory(filename);
      continue;
    }
    const publicPath = `/${path.relative(path.join(root, "public"), filename).split(path.sep).join("/")}`;
    const asset = approved.get(publicPath);
    if (!asset) {
      errors.push(`Unverified photo in public: ${publicPath}`);
      continue;
    }
    const bytes = await readFile(filename);
    if (!isManufacturerUrl(asset.source_page) || !isManufacturerUrl(asset.image_url)) {
      errors.push(`Photo source is outside the specified manufacturer websites: ${publicPath}`);
    }
    if (!["manufacturer-product-gallery", "manufacturer-campaign", "manufacturer-service-showcase"].includes(asset.source_kind) || /pre-?owned|used-aircraft|dealer/i.test(asset.source_page)) {
      errors.push(`Photo is not approved manufacturer promotional imagery: ${publicPath}`);
    }
    if (!asset.visually_inspected || asset.ui_overlay_free !== true) {
      errors.push(`Photo has not passed visual review for gallery counters, controls and overlays: ${publicPath}`);
    }
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (asset.scene === "exterior" && asset.flight_status !== "in-flight") {
      errors.push(`Exterior photo is not verified in-flight promotional photography: ${publicPath}`);
    }
    if (sha256 !== asset.sha256) errors.push(`Photo differs from verified manufacturer bytes: ${publicPath}`);
    if (!asset.source_page || !asset.image_url || !asset.source_bytes_verified_on) {
      errors.push(`Missing source evidence: ${publicPath}`);
    }
    approved.delete(publicPath);
  }
}

await checkDirectory(path.join(root, "public/images"));
for (const filename of approved.keys()) errors.push(`Missing verified photo: ${filename}`);
// Editorial and service heroes must tell separate visual stories. Reusing an
// article's image in its own teaser is allowed; sharing it across pages is not.
const primaryPhotos = new Map();
for (const collection of ["articles.json", "services.json"]) {
  const pages = JSON.parse(await readFile(path.join(root, "data", collection), "utf8"));
  for (const page of pages) {
    if (!page.image) continue;
    const pagePath = page.path ?? `/articles/${page.slug}`;
    const previous = primaryPhotos.get(page.image.src);
    if (previous) errors.push(`Repeated editorial hero: ${page.image.src} on ${previous} and ${pagePath}`);
    primaryPhotos.set(page.image.src, pagePath);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Photography check passed: ${manifest.assets.length} approved files match their recorded hashes; no unapproved photos packaged.`);
}
