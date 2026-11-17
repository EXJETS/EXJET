import type { MetadataRoute } from "next";
import { aircraft } from "@/data/aircraft";
import { contentPages } from "@/data/editorial";
import { salesListings } from "@/data/sales";
import { absoluteUrl } from "@/data/site";

const contentRevision = "2026-10-24";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const originals = ["/", "/charter", "/empty-legs", "/group-charter", "/cargo", "/aircraft", "/why-exjet", "/about", "/faq", "/contact", "/sales"];
  const detailPages = aircraft.map(item => `/aircraft/${item.slug}`);
  const salesPages = salesListings.map(listing => `/sales/${listing.slug}`);
  const pages = contentPages.filter(page => !page.noindex && !page.draft);
  return [...originals, ...detailPages, ...salesPages, ...pages.map(page => page.path)].map(path => {
    const page = pages.find(item => item.path === path);
    return { url: absoluteUrl(path === "/" ? path : `${path}/`), lastModified: page?.updated || contentRevision };
  });
}
