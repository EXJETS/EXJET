import type { MetadataRoute } from "next";
import jetsData from "@/data/jets.json";

const BASE = "https://exjet.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/tracking`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const jetRoutes: MetadataRoute.Sitemap = (
    jetsData as unknown as { id: string }[]
  ).map((jet) => ({
    url: `${BASE}/jets/${jet.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...jetRoutes];
}
