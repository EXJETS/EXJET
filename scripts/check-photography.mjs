import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, "PHOTO-SOURCES.json"), "utf8"));
const approved = new Map(manifest.assets.map(asset => [asset.file, asset]));
const errors = [];
const manufacturerHosts = ["bombardier.com", "gulfstream.com", "cessna.txtav.com", "dassaultfalcon.com", "dassault-business.com", "embraer.com", "boeing.com"];
// Official media services are checked as source/asset pairs. A CDN hostname
// alone is not provenance and must never approve unrelated third-party images.
function isVerifiedManufacturerMedia(asset) {
  // The user's fallback sourcing allowance is limited here to one inspected,
  // uncropped archival photo explicitly credited to Bombardier Aerospace.
  // Its publisher provenance and 800px limit remain disclosed in the manifest.
  if (asset.source_kind === "manufacturer-credited-republication") {
    return asset.model === "Challenger 300" &&
      asset.source_page === "https://www.bjtonline.com/business-jet-news/bombardiers-challenger-300" &&
      asset.image_url === "https://www.bjtonline.com/sites/bjtonline.com/files/01_c300_03a_507.jpg" &&
      Boolean(asset.source_limitation);
  }
  if (asset.source_kind !== "manufacturer-press-photo") return false;
  const pairs = [
    ["https://www.gulfstreamnews.com/en/media/", [
      "https://gulfstream.widen.net/content/j3bbqgfcga/jpeg/d_g650_a_newsroom_00210.jpeg?position=c&color=ffffffff&quality=80&u=ozllfz",
      "https://gulfstream.widen.net/content/cmwvhawnv9/jpeg/d_g650_g650ER_i_newsroom_0147.jpeg?position=c&color=ffffffff&quality=80&u=ozllfz",
    ]],
    ["https://media.txtav.com/194346-textron-aviation-brings-faster-connectivity-to-one-of-the-fastest-civilian-aircraft-in-the-world/", [
      "https://d21buns5ku92am.cloudfront.net/69280/images/373766-750_X_0004-44bb54-original-1608525319.jpg",
    ]],
    ["https://www.globenewswire.com/news-release/2020/12/23/2150237/0/en/bombardier-announces-sale-of-10-challenger-350-business-jets.html", [
      "https://ml.globenewswire.com/Resource/Download/c7bf275c-aace-4393-9d94-dd0d664aca94",
    ]],
  ];
  return pairs.some(([source, images]) => source === asset.source_page && images.includes(asset.image_url));
}
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
    // Explicit owner selections: the uploaded hero and restored original cargo photo.
    // Retain exact bytes without asserting independent manufacturer provenance.
    const isOwnerSelection =
      (publicPath === "/images/home/owner-selected-hero.webp" && asset.source_kind === "user-selected-upload") ||
      (publicPath === "/images/cargo-charter-747.webp" && asset.source_kind === "user-selected-existing-asset");
    if (isOwnerSelection) {
      const hash = createHash("sha256").update(bytes).digest("hex");
      if (hash !== asset.sha256 || !asset.user_approved_on || !asset.source_library_file_id) {
        errors.push(`Owner-selected image differs from approved source: ${publicPath}`);
      }
      approved.delete(publicPath);
      continue;
    }
    if ((!isManufacturerUrl(asset.source_page) || !isManufacturerUrl(asset.image_url)) && !isVerifiedManufacturerMedia(asset)) {
      errors.push(`Photo source is outside the specified manufacturer websites: ${publicPath}`);
    }
    if (!["manufacturer-product-gallery", "manufacturer-campaign", "manufacturer-press-photo", "manufacturer-service-showcase", "manufacturer-credited-republication"].includes(asset.source_kind) || /pre-?owned|used-aircraft|dealer/i.test(asset.source_page)) {
      errors.push(`Photo is not approved manufacturer promotional imagery: ${publicPath}`);
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
