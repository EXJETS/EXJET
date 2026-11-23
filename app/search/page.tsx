import { isRetiredPublicPath } from "@/data/public-route-retirements";
import { Suspense } from "react";
import { SiteSearch } from "@/components/SiteSearch";
import { FlightPageHeading } from "@/components/FlightPageHeading";
import { contentPages } from "@/data/editorial";
import { directoryAircraft as aircraft } from "@/data/aircraft-directory";
import { pageSeo, buildDynamicMetadata } from "@/data/seo";
import { contentSearchItem } from "@/data/search";

export const metadata = buildDynamicMetadata({ path: "/search", title: "Search EXJET", description: "Find EXJET charter services, aircraft, destinations, airport guides and charter articles.", noindex: true });
const items = [
  ...Object.entries(pageSeo).filter(([path]) => !["/privacy", "/terms", "/account", "/search"].includes(path)).map(([path, entry]) => ({ path, title: entry.title, description: entry.description })),
  ...contentPages.filter(page => !page.draft && !page.noindex).map(contentSearchItem),
  ...aircraft.map(item => ({ path: `/aircraft/${item.slug}`, title: item.name, description: item.category })),
 ].filter(item => !isRetiredPublicPath(item.path));
export default function SearchPage() {
  return <div className="ex-editorial"><FlightPageHeading label="Search EXJET" title="Find what you need." description="Look up aircraft models, airports, routes, and charter guides." /><Suspense fallback={<p className="ex-container" role="status">Loading search…</p>}><SiteSearch items={Array.from(new Map(items.map(item => [item.path, item])).values())} /></Suspense></div>;
}
