#!/usr/bin/env node
/**
 * Scrapes aircraft operator listings from the ARGUS International
 * Operator Registry (https://www.argus.aero/operatorregistry) and writes
 * the results to a JSON file.
 *
 * Why Playwright instead of a plain fetch: the registry's listing UI
 * renders client-side, so a raw HTTP GET only returns an empty shell.
 *
 * Usage:
 *   node scripts/scrape-argus-operators.mjs
 *   node scripts/scrape-argus-operators.mjs --max-pages=5 --out=src/data/argus-operators.json
 *   node scripts/scrape-argus-operators.mjs --delay-ms=1500
 *
 * Requirements:
 *   - `npm install` (pulls in the `playwright` devDependency)
 *   - `npx playwright install chromium` the first time, unless a
 *     pre-installed browser is already reachable (see CHROMIUM_PATH below)
 *   - Outbound network access to argus.aero. This is blocked in some
 *     sandboxed CI/agent environments — if you see a proxy/egress error,
 *     run this script from a machine or CI runner with open internet
 *     access instead.
 *
 * IMPORTANT — selectors are best-effort:
 * This script was authored without the ability to load the live page
 * (network access to argus.aero was blocked in the authoring environment),
 * so the DOM selectors below are informed guesses based on the registry's
 * known URL structure:
 *   - listing: https://www.argus.aero/argus_rated_operator/argus-aviation-ratings/page/{n}/
 *   - detail:  https://www.argus.aero/argus_ratings/{operator-slug}/
 * If a run produces zero results, open the listing page in a real browser,
 * inspect the operator card / link markup with devtools, and update the
 * SELECTORS block below to match. The detail-page scraper also falls back
 * to dumping raw visible text (`rawText`) per operator so nothing is lost
 * even if the labeled-field heuristics don't match the real markup.
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const SELECTORS = {
  // Links on the listing page that point at an operator detail page.
  operatorLink: 'a[href*="/argus_ratings/"]',
  // "Next page" control on the listing page, if present.
  nextPageLink: 'a[rel="next"], a:has-text("Next")',
};

const BASE = "https://www.argus.aero";
const LISTING_URL = (n) =>
  n <= 1
    ? `${BASE}/argus_rated_operator/argus-aviation-ratings/`
    : `${BASE}/argus_rated_operator/argus-aviation-ratings/page/${n}/`;

function parseArgs(argv) {
  const args = { maxPages: 200, out: "src/data/argus-operators.json", delayMs: 1000 };
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key === "max-pages") args.maxPages = Number(value);
    if (key === "out") args.out = value;
    if (key === "delay-ms") args.delayMs = Number(value);
  }
  return args;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function collectListingPage(page, pageNum) {
  const url = LISTING_URL(pageNum);
  console.log(`[listing] page ${pageNum}: ${url}`);
  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (!response || response.status() === 404) {
    return { entries: [], hasNext: false };
  }

  // Give client-rendered lists a moment to hydrate.
  await page.waitForSelector(SELECTORS.operatorLink, { timeout: 10_000 }).catch(() => {});

  const entries = await page.$$eval(SELECTORS.operatorLink, (anchors) =>
    anchors.map((a) => ({
      name: a.textContent?.trim() || "",
      detailUrl: a.href,
    }))
  );

  const hasNext = (await page.$(SELECTORS.nextPageLink)) !== null;

  return { entries: entries.filter((e) => e.name && e.detailUrl), hasNext };
}

async function scrapeOperatorDetail(page, url) {
  console.log(`  [detail] ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });

  const data = await page.evaluate(() => {
    const text = document.body.innerText;
    const h1 = document.querySelector("h1")?.textContent?.trim() || null;

    // Heuristic label -> value extraction for common registry fields.
    // Matches lines like "ARGUS Rating: Platinum Elite" or
    // "Location\nMiami, FL" that commonly appear in profile pages.
    const fieldNames = [
      "ARGUS Rating",
      "Rating",
      "Location",
      "Address",
      "Phone",
      "Website",
      "Certificate Number",
      "Aircraft",
      "Base",
      "Contact",
    ];
    const fields = {};
    for (const label of fieldNames) {
      const re = new RegExp(`${label}\\s*[:\\n]\\s*([^\\n]+)`, "i");
      const match = text.match(re);
      if (match) fields[label] = match[1].trim();
    }

    return { h1, fields, rawText: text.slice(0, 4000) };
  });

  return {
    name: data.h1,
    url,
    rating: data.fields["ARGUS Rating"] || data.fields["Rating"] || null,
    location: data.fields["Location"] || data.fields["Base"] || null,
    address: data.fields["Address"] || null,
    phone: data.fields["Phone"] || data.fields["Contact"] || null,
    website: data.fields["Website"] || null,
    certificateNumber: data.fields["Certificate Number"] || null,
    aircraft: data.fields["Aircraft"] || null,
    rawText: data.rawText,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const chromiumPath = process.env.CHROMIUM_PATH; // e.g. /opt/pw-browsers/chromium
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromiumPath || undefined,
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (compatible; EXJETOperatorScraper/1.0; +https://exjet.example/contact)",
  });
  const page = await context.newPage();

  const listings = [];
  let pageNum = 1;
  while (pageNum <= args.maxPages) {
    const { entries, hasNext } = await collectListingPage(page, pageNum);
    if (entries.length === 0 && pageNum > 1) break;
    listings.push(...entries);
    if (!hasNext) break;
    pageNum += 1;
    await sleep(args.delayMs);
  }

  // De-dupe by detail URL.
  const seen = new Set();
  const uniqueListings = listings.filter((entry) => {
    if (seen.has(entry.detailUrl)) return false;
    seen.add(entry.detailUrl);
    return true;
  });
  console.log(`Found ${uniqueListings.length} unique operator links across ${pageNum} listing page(s).`);

  const operators = [];
  for (const entry of uniqueListings) {
    try {
      const detail = await scrapeOperatorDetail(page, entry.detailUrl);
      operators.push({ ...detail, name: detail.name || entry.name });
    } catch (err) {
      console.warn(`  failed to scrape ${entry.detailUrl}: ${err.message}`);
      operators.push({ name: entry.name, url: entry.detailUrl, error: err.message });
    }
    await sleep(args.delayMs);
  }

  await browser.close();

  const outPath = path.resolve(process.cwd(), args.out);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(operators, null, 2));
  console.log(`Wrote ${operators.length} operators to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
