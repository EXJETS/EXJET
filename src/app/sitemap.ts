import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/charter/", "/empty-legs/"].map((p) => ({
    url: `https://exjet.com${p}`,
    changeFrequency: "daily",
    priority: p === "/" ? 1 : 0.8,
  }));
}
