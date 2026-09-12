"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

export type SearchItem = { path: string; title: string; description: string };
export function SiteSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? items.filter(item => words.every(word => `${item.title} ${item.description}`.toLowerCase().includes(word))) : items.filter(item => ["/private-jet-charter", "/aircraft", "/articles", "/routes", "/airports", "/pricing"].includes(item.path));
  return <div className="ex-container ex-site-search">
    <label className="ex-search-form"><MagnifyingGlassIcon size={24} aria-hidden="true" /><span className="sr-only">Search EXJET</span><input type="search" placeholder="Aircraft, airports, routes, guides" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div className="ex-search-results"><p className="ex-search-count" aria-live="polite">{words.length ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Explore EXJET"}</p>
      {results.map(item => <article className="ex-search-result" key={item.path}><h2><Link href={item.path}>{item.title.replace(/ \| EXJET$/, "")}</Link></h2><p>{item.description}</p></article>)}
      {words.length && !results.length ? <p>Try an aircraft name, city, or topic such as “charter pricing”.</p> : null}
    </div>
  </div>;
}
