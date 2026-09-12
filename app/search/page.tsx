import { SiteSearch } from "@/components/SiteSearch";
import { contentPages } from "@/data/editorial";
import { aircraft } from "@/data/aircraft";
import { pageSeo, buildDynamicMetadata } from "@/data/seo";

export const metadata = buildDynamicMetadata({ path: "/search", title: "Search EXJET", description: "Find aircraft, destinations, airport guides, and private charter articles.", noindex: true });
const items = [
  ...Object.entries(pageSeo).filter(([path]) => !["/privacy", "/terms", "/account"].includes(path)).map(([path, entry]) => ({ path, title: entry.title, description: entry.description })),
  ...contentPages.filter(page => !page.draft).map(page => ({ path: page.path, title: page.title, description: page.description })),
  ...aircraft.map(item => ({ path: `/aircraft/${item.slug}`, title: item.name, description: item.category })),
];
export default function SearchPage() {
  return <div className="ex-editorial"><header className="ex-page-intro ex-container"><p className="ex-kicker">Search EXJET</p><h1>What’s on your horizon?</h1></header><SiteSearch items={items} /></div>;
}
