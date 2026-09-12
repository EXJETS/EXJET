import type { MetadataRoute } from "next";
import { aircraft } from "@/data/aircraft";
import { contentPages } from "@/data/editorial";
import { absoluteUrl } from "@/data/site";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const originals = ["/", "/charter", "/empty-legs", "/group-charter", "/cargo", "/aircraft", "/why-exjet", "/about", "/faq", "/contact"];
  const detailPages = aircraft.map(item => `/aircraft/${item.slug}`);
  const pages = contentPages.filter(page => !page.noindex && !page.draft);
  return [...originals, ...detailPages, ...pages.map(page => page.path)].map(path => {
    const page = pages.find(item => item.path === path);
    return { url: absoluteUrl(path === "/" ? path : `${path}/`), ...(page?.updated ? { lastModified: page.updated } : {}) };
  });
}
