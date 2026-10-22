import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account/", "/trips/", "/operator/", "/admin/", "/charter/book/"] },
    sitemap: "https://exjet.com/sitemap.xml",
  };
}
