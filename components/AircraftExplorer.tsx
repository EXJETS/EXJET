"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { AirplaneTiltIcon } from "@phosphor-icons/react/dist/csr/AirplaneTilt";
import type { Aircraft } from "@/data/aircraft";
import type { AircraftComparison } from "@/data/aircraft-reference";
import styles from "./Explore.module.css";

export function AircraftExplorer({ items, references }: { items: Aircraft[]; references: Record<string, AircraftComparison | undefined> }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All aircraft");
  const [selected, setSelected] = useState<string[]>([]);
  const categories = ["All aircraft", ...new Set(items.map(item => item.category))];
  const visible = items.filter(item => (category === "All aircraft" || item.category === category) && `${item.name} ${item.maker} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const compared = items.filter(item => selected.includes(item.slug));
  const toggle = (slug: string) => setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : current.length < 3 ? [...current, slug] : current);

  return <section className={`${styles.section} ${selected.length ? styles.hasShortlist : ""}`} aria-labelledby="aircraft-explorer-title">
    <div className={`${styles.heading} ${styles.explorerIntro}`}><div><p className={styles.kicker}>Find your aircraft</p><h2 id="aircraft-explorer-title">Explore. Compare. Decide.</h2><p>Discover cabin choices and compare up to three aircraft. Your advisor confirms the aircraft and configuration for your trip.</p></div></div>
    <div className={styles.toolbar}>
      <label className={styles.search}><MagnifyingGlassIcon size={20} aria-hidden="true" /><span className="sr-only">Search aircraft</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Aircraft or manufacturer" enterKeyHint="search" /></label>
      <label className={styles.select}><span>Cabin class</span><select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      {(query || category !== "All aircraft") && <button className={styles.textButton} onClick={() => { setQuery(""); setCategory("All aircraft"); }}>Reset filters</button>}
    </div>
    <p className={styles.resultCount} role="status">{visible.length} aircraft {visible.length === 1 ? "profile" : "profiles"}{selected.length ? ` · ${selected.length} selected for comparison` : ""}</p>
    <div className={styles.grid}>{visible.map(item => <article className={styles.card} key={item.slug}>
      <Link className={styles.aircraftPhoto} href={`/aircraft/${item.slug}`} aria-label={`Explore ${item.name}`}>
        {item.image ? <Image src={item.image} alt={`${item.maker} ${item.name}`} width={800} height={480} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" style={{ objectFit: item.cardFit || "contain" }} /> : <AirplaneTiltIcon size={64} weight="light" aria-hidden="true" />}
      </Link>
      <div className={styles.cardBody}><p className={styles.kicker}>{item.category}</p><h3><Link href={`/aircraft/${item.slug}`}>{item.name}</Link></h3><p>{item.summary}</p>
        <dl className={styles.facts}><div><dt>Passengers</dt><dd>{item.typical.passengers}</dd></div><div><dt>{references[item.slug] ? "Published range" : "Cabin"}</dt><dd>{references[item.slug]?.range ?? item.typical.cabin}</dd></div></dl>
        <div className={styles.cardActions}><Link href={`/aircraft/${item.slug}`}>Explore aircraft <ArrowRightIcon size={18} aria-hidden="true" /></Link>
          <label className={styles.compareCheck}><input type="checkbox" checked={selected.includes(item.slug)} disabled={selected.length === 3 && !selected.includes(item.slug)} onChange={() => toggle(item.slug)} /><span>Compare<span className="sr-only"> {item.name}</span></span></label></div>
      </div>
    </article>)}</div>
    {!visible.length && <div className={styles.empty}><MagnifyingGlassIcon size={36} aria-hidden="true" /><h3>No matching aircraft</h3><p>Try a model name, manufacturer, or a different cabin class.</p><button className="button button--dark" onClick={() => { setQuery(""); setCategory("All aircraft"); }}>Show all aircraft</button></div>}
    {compared.length > 0 && <aside className={styles.shortlistBar} aria-label="Selected aircraft">
      <span>{compared.length} of 3 selected</span>
      <a href="#aircraft-comparison">Compare aircraft <ArrowRightIcon size={16} aria-hidden="true" /></a>
      <button type="button" aria-label="Clear selected aircraft" onClick={() => setSelected([])}><XIcon size={20} aria-hidden="true" /></button>
    </aside>}
    {compared.length > 0 && <section id="aircraft-comparison" tabIndex={-1} className={styles.comparison} aria-labelledby="comparison-title">
      <div className={styles.heading}><div><p className={styles.kicker}>Side by side</p><h2 id="comparison-title">Your aircraft shortlist</h2><p>{compared.length === 1 ? "Select another aircraft to compare cabin and mission details." : "These are planning profiles. Confirm the exact tail, configuration and mission performance with your advisor."}</p></div><button className={styles.textButton} onClick={() => setSelected([])}>Clear comparison</button></div>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Aircraft comparison table"><table><caption className="sr-only">Aircraft planning profiles</caption><thead><tr><th scope="col">Compare</th>{compared.map(item => <th scope="col" key={item.slug}>{item.name}<button className={styles.remove} aria-label={`Remove ${item.name} from comparison`} onClick={() => toggle(item.slug)}><XIcon size={16} aria-hidden="true" /></button></th>)}</tr></thead><tbody>
        {([['Category', 'category'], ['Passengers', 'passengers'], ['Cabin', 'cabin']] as const).map(([label,key]) => <tr key={key}><th scope="row">{label}</th>{compared.map(item => <td key={item.slug}>{key === 'category' ? item.category : item.typical[key]}</td>)}</tr>)}
        {([['Published range', 'range'], ['Cabin height', 'height'], ['Cabin width', 'width'], ['Cabin length', 'length'], ['Baggage volume', 'baggage']] as const).map(([label,key]) => <tr key={key}><th scope="row">{label}</th>{compared.map(item => <td key={item.slug}>{references[item.slug]?.[key] ?? (key === 'range' ? item.typical.range : key === 'baggage' ? item.typical.baggage : 'Confirm with advisor')}</td>)}</tr>)}
        <tr><th scope="row">Manufacturer reference</th>{compared.map(item => <td key={item.slug}>{references[item.slug] ? <a href={references[item.slug]!.source} target="_blank" rel="noopener noreferrer">{item.name} specifications <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a> : 'Ask your advisor for model specifications'}</td>)}</tr>
        <tr><th scope="row">Next step</th>{compared.map(item => <td key={item.slug}><Link href={`/aircraft/${item.slug}`}>View {item.name}</Link></td>)}</tr>
      </tbody></table></div>
      <p className={styles.comparisonNote}>Published figures describe the aircraft model, not the available aircraft. Range assumptions differ by manufacturer; payload, reserves and conditions affect each mission. Review the model page for operating assumptions and representative layouts.</p>
      <Link className="button button--dark" href="/contact">Discuss your shortlist <ArrowRightIcon size={18} aria-hidden="true" /></Link>
    </section>}
  </section>;
}
