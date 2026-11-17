"use client";

import Link from "next/link";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import styles from "./Explore.module.css";

export type DirectoryItem = { path: string; title: string; description: string; kicker: string; searchText: string; codes?: string[] };

export function ContentDirectory({ items, title }: { items: DirectoryItem[]; title: string }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const filtered = items.filter(item => item.searchText.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = sort === "alphabetical" ? [...filtered].sort((a,b) => a.title.localeCompare(b.title)) : filtered;
  return <section className={`${styles.section} ${styles.directory}`} aria-labelledby="directory-title">
    <div className={styles.heading}><h2 id="directory-title">{title}</h2></div>
    <div className={styles.toolbar}><label className={styles.search}><MagnifyingGlassIcon size={20} aria-hidden="true" /><span className="sr-only">Search this collection</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this collection" /></label><label className={styles.select}><span>Sort</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="alphabetical">A–Z</option></select></label>{query && <button className={styles.textButton} onClick={() => setQuery("")}>Clear search</button>}</div>
    <p className={styles.resultCount} role="status">{visible.length} {visible.length === 1 ? "result" : "results"}</p>
    <div className={styles.grid}>{visible.map(item => <article className={styles.card} key={item.path}><div className={styles.cardBody}>
      {item.codes?.length === 2 && <div className={styles.routeCodes}><span>{item.codes[0]}</span><ArrowRightIcon size={24} aria-hidden="true" /><span>{item.codes[1]}</span></div>}
      <p className={styles.kicker}>{item.kicker}</p><h3><Link href={item.path}>{item.title}</Link></h3><p>{item.description}</p><Link className={styles.cardLink} href={item.path}>Explore <ArrowRightIcon size={18} aria-hidden="true" /><span className="sr-only"> {item.title}</span></Link>
    </div></article>)}</div>
    {!visible.length && <div className={styles.empty}><h3>No results for this search</h3><p>Try a broader place name, airport code, or topic.</p><button className="button button--dark" onClick={() => setQuery("")}>Show all results</button></div>}
  </section>;
}
