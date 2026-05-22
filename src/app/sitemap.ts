import type { MetadataRoute } from "next";
import blogPosts from "@/data/luminary-blog.json";

const BASE = "https://luminary.aero";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/cabin-comfort-systems`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/cabin-comfort-systems/aircraft-insulation-basics`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/cabin-comfort-systems/insulation-products`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/performance-history`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/special-mission-interiors`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/vip-interiors`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
