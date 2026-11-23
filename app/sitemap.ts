import type { MetadataRoute } from "next";
import { aircraft } from "@/data/aircraft";
import { contentPages } from "@/data/editorial";
import { pageSeo } from "@/data/seo";
import { absoluteUrl } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // The same indexability flags drive the page metadata and the sitemap.
  // Build-time checks reject duplicate entries, noncanonical URLs and drift.
  const staticPaths = Object.entries(pageSeo).flatMap(([path, entry]) =>
    "noindex" in entry && entry.noindex ? [] : [{ path }],
  );
  const aircraftPaths = aircraft.map(item => ({ path: `/aircraft/${item.slug}` }));
  const editorialPaths = contentPages
    .filter(page => !page.noindex && !page.draft)
    .map(page => ({ path: page.path, lastModified: page.updated }));
  const entries: { path: string; lastModified?: string }[] = [
    ...staticPaths, ...aircraftPaths, ...editorialPaths,
  ];
  // Never use the build time as lastmod. Omit dates we don't know.
  return entries.map(({ path, lastModified }) => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  }));
}
