"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { SunHorizonIcon } from "@phosphor-icons/react/dist/csr/SunHorizon";
import { MountainsIcon } from "@phosphor-icons/react/dist/csr/Mountains";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { BinocularsIcon } from "@phosphor-icons/react/dist/csr/Binoculars";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { normalizeSearch } from "@/data/search";
import styles from "./TravelJournal.module.css";

export type JournalItem = {
  path: string;
  title: string;
  description: string;
  category: string;
  region: string;
  readTime?: string;
  focus: string;
};

const categories = ["All guides", "Islands & coast", "Alpine escapes", "Culture & dining", "Safari & nature", "Experience guides"];
const categoryIcons = {
  "Islands & coast": SunHorizonIcon,
  "Alpine escapes": MountainsIcon,
  "Culture & dining": BuildingsIcon,
  "Safari & nature": BinocularsIcon,
  "Experience guides": CompassIcon,
};
const normalize = (value: string) => normalizeSearch(value).replace(/[.'’]/g, "");

export function TravelJournalDirectory({ items }: { items: JournalItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All guides");
  const [region, setRegion] = useState("All regions");
  const [sort, setSort] = useState("editorial");
  const regions = [...new Set(items.map(item => item.region))].sort();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtered = items.filter(item => {
    const text = normalize(`${item.title} ${item.description} ${item.category} ${item.region} ${item.focus}`);
    return (category === "All guides" || item.category === category)
      && (region === "All regions" || item.region === region)
      && words.every(word => text.includes(word));
  });
  const visible = sort === "alphabetical" ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : filtered;
  const hasFilters = Boolean(query || category !== "All guides" || region !== "All regions");
  const reset = () => { setQuery(""); setCategory("All guides"); setRegion("All regions"); };
  const experiences = items.filter(item => item.category === "Experience guides").length;

  return <section className={styles.directory} aria-labelledby="travel-directory-title">
    <div className={styles.heading}>
      <h2 id="travel-directory-title">Find your next escape</h2>
      <p>{items.length - experiences} destinations. {experiences} experience guides.</p>
    </div>
    <div className={styles.categories} role="group" aria-label="Browse by interest">
      {categories.map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
    </div>
    <div className={styles.toolbar}>
      <label className={styles.search}><MagnifyingGlassIcon size={20} aria-hidden="true" /><span className="sr-only">Search the Travel Journal</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search places or experiences" /></label>
      <label className={styles.select}><span>Region</span><select value={region} onChange={event => setRegion(event.target.value)}><option>All regions</option>{regions.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className={styles.select}><span>Sort</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="editorial">Editorial order</option><option value="alphabetical">A–Z</option></select></label>
    </div>
    <div className={styles.results}><p role="status" aria-live="polite" aria-atomic="true">{visible.length} {visible.length === 1 ? "guide" : "guides"}{hasFilters ? " found" : " to explore"}</p>{hasFilters ? <button type="button" onClick={reset}>Clear filters</button> : null}</div>
    <div className={styles.grid}>
      {visible.map(item => {
        const Icon = categoryIcons[item.category as keyof typeof categoryIcons] ?? CompassIcon;
        return <article key={item.path} className={styles.card}>
          <div className={styles.cardTop}><Icon size={30} weight="light" aria-hidden="true" /><span>{item.region} · {item.readTime}</span></div>
          <p className={styles.category}>{item.category}</p>
          <h3><Link href={item.path}>{item.title}</Link></h3>
          <p className={styles.description}>{item.description}</p>
          <Link className={styles.readLink} href={item.path}>Read the guide <ArrowRightIcon size={18} aria-hidden="true" /><span className="sr-only">: {item.title}</span></Link>
        </article>;
      })}
    </div>
    {!visible.length ? <div className={styles.empty}><CompassIcon size={32} weight="light" aria-hidden="true" /><h3>No guides match these filters</h3><p>Try another place, a broader interest, or clear the filters to explore the full journal.</p><button type="button" className="button button--dark" onClick={reset}>Show all guides</button></div> : null}
  </section>;
}
