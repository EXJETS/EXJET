"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

export type SearchItem = { path: string; title: string; description: string; keywords?: string };
const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[-/]/g, " ");
export function SiteSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const results = words.length ? items.map(item => {
    const title = normalize(item.title);
    const text = normalize(`${item.title} ${item.description} ${item.path} ${item.keywords || ""}`);
    return { item, score: words.every(word => text.includes(word)) ? words.reduce((score, word) => score + (title.includes(word) ? 3 : 1), 0) : 0 };
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.item)
    : items.filter(item => ["/executive-assistants", "/family-office-private-aviation", "/aircraft", "/routes", "/airports", "/pricing"].includes(item.path));
  return <div className="ex-container ex-site-search">
    <div className="ex-search-form" role="search" aria-label="Search EXJET">
      <MagnifyingGlassIcon size={24} aria-hidden="true" />
      <label className="sr-only" htmlFor="site-search">Search EXJET</label>
      <input ref={input} id="site-search" type="search" placeholder="Aircraft, airports, routes, guides" value={query} maxLength={200} onChange={event => setQuery(event.target.value)} aria-controls="site-search-results" autoComplete="off" />
      {query ? <button className="ex-search-clear" type="button" aria-label="Clear search" onClick={() => { setQuery(""); input.current?.focus(); }}><XIcon size={18} aria-hidden="true" /></button> : null}
    </div>
    <div className="ex-search-results" id="site-search-results"><p className="ex-search-count" role="status">{words.length ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Explore EXJET"}</p>
      {results.map(item => <article className="ex-search-result" key={item.path}><h2><Link href={item.path}>{item.title.replace(/ \| EXJET$/, "")}</Link></h2><p>{item.description}</p></article>)}
      {words.length > 0 && !results.length ? <p>No matching pages. Try an aircraft name, city, “executive assistant” or “charter pricing”. You can also <Link href="/contact">ask an EXJET advisor</Link>.</p> : null}
    </div>
  </div>;
}
