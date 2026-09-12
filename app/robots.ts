import type { MetadataRoute } from "next";
import { absoluteUrl, isPublicProduction, siteOrigin } from "@/data/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isPublicProduction ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteOrigin,
  };
}
