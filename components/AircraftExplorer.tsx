"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { GridFourIcon } from "@phosphor-icons/react/dist/csr/GridFour";
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { Aircraft } from "@/data/aircraft";
import type { AircraftComparison } from "@/data/aircraft-reference";
import { AircraftRangeMap } from "./AircraftRangeMap";
import type { ModelSpecification } from "@/data/aircraft-directory";
import styles from "./Explore.module.css";
import catalog from "./AircraftCatalog.module.css";

export function AircraftExplorer({ items, models = [], references = {} }: { items: Aircraft[]; models?: readonly ModelSpecification[]; references?: Record<string, AircraftComparison | undefined> }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All aircraft");
  const [maker, setMaker] = useState("");
  const [filters, setFilters] = useState(false);
  const [view, setView] = useState<"profiles"|"split">("split");
  const [selected, setSelected] = useState<string[]>([]);
  const ResultsHeading = models.length ? "h1" : "h2";
  const categories = ["All aircraft", ...new Set(items.map(item => item.category))];
  const makers = Array.from(new Set(items.map(item => item.maker))).sort();
  const reset = () => { setQuery(""); setCategory("All aircraft"); setMaker(""); };
  const visible = items.filter(item => (!maker || item.maker === maker) && (category === "All aircraft" || item.category === category) && `${item.name} ${item.maker} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
  const compared = items.filter(item => selected.includes(item.slug));
  const getModel = (slug: string) => models.find(model => model.slug === slug);
  const toggle = (slug: string) => setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : current.length < 3 ? [...current, slug] : current);

  return <section className={`${styles.section} ${styles.marketExplorer} ${catalog.catalog} ${selected.length ? styles.hasShortlist : ""}`} aria-labelledby="aircraft-explorer-title">
    <div className={catalog.searchZone}><div className={catalog.searchBand}>
      <label className={catalog.searchControl}><span>Find a model</span><span className={catalog.searchInput}><MagnifyingGlassIcon size={20} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Aircraft or manufacturer" enterKeyHint="search" /></span></label>
      <label className={catalog.searchControl}>Cabin class<select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      <button type="button" className={catalog.control} aria-expanded={filters} aria-controls="aircraft-advanced-filters" onClick={() => setFilters(!filters)}><SlidersHorizontalIcon size={18} aria-hidden="true"/>{filters ? "Hide filters" : "Filters"}</button>
    </div></div>
    <div id="aircraft-advanced-filters" hidden={!filters} className={catalog.extraFilters}>
      <label className={catalog.searchControl}>Manufacturer<select value={maker} onChange={event=>setMaker(event.target.value)}><option value="">All manufacturers</option>{makers.map(name=><option key={name}>{name}</option>)}</select></label>
      <button type="button" className={catalog.control} onClick={reset}>Reset filters</button>
    </div>
    <div className={catalog.resultsHead}><div><ResultsHeading id="aircraft-explorer-title">Explore aircraft</ResultsHeading><p className={styles.resultCount} role="status">{visible.length} {visible.length === 1 ? "profile" : "profiles"}{selected.length ? ` · ${selected.length} selected for comparison` : ""} · Planning profiles, not live inventory</p></div>
      <div className={catalog.view} role="group" aria-label="Directory view"><button type="button" className={catalog.control} aria-pressed={view==="profiles"} onClick={()=>setView("profiles")}><GridFourIcon size={17} aria-hidden="true"/> Profiles</button><button type="button" className={catalog.control} aria-pressed={view==="split"} onClick={()=>setView("split")}><MapTrifoldIcon size={17} aria-hidden="true"/> Compare view</button></div>
    </div>
    <div className={styles.marketFilters} role="group" aria-label="Cabin class quick filters">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className={view==="split" ? catalog.split : undefined}>
      <div>
      <div className={`${styles.grid} ${catalog.cards}`}>{visible.map(item => <article className={styles.card} key={item.slug}>
      {item.image ? <Link className={styles.aircraftPhoto} href={`/aircraft/${item.slug}`} aria-label={`Explore ${item.name}`}>
        <Image src={item.image} alt={`${item.name} ${item.scenes.find(scene => scene.image === item.image)?.label.toLowerCase() ?? "aircraft"}`} width={800} height={480} sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: item.cardFit || "contain" }} />
      </Link> : <div className={catalog.noPhoto}><span>{item.maker}</span><small>No approved photo shown</small></div>}
      <div className={styles.cardBody}><p className={styles.kicker}>{item.maker} · {item.category}</p><h3><Link href={`/aircraft/${item.slug}`}>{item.name}</Link></h3><p>{getModel(item.slug)?.requestOnly ? "Request only. Discuss this model with an advisor." : item.summary}</p>
        <dl className={styles.facts}><div><dt>Passengers</dt><dd>{item.typical.passengers}</dd></div><div><dt>{models.length || references[item.slug] ? "Published range" : "Cabin"}</dt><dd>{references[item.slug]?.range ?? (models.length ? item.typical.range : item.typical.cabin)}</dd></div></dl>
        <div className={styles.cardActions}><Link href={`/aircraft/${item.slug}`}>Explore aircraft <ArrowRightIcon size={18} aria-hidden="true" /></Link>
          <label className={styles.compareCheck}><input type="checkbox" checked={selected.includes(item.slug)} disabled={selected.length === 3 && !selected.includes(item.slug)} onChange={() => toggle(item.slug)} /><span>Compare<span className="sr-only"> {item.name}</span></span></label></div>
      </div>
    </article>)}</div>
    {!visible.length && <div className={styles.empty}><MagnifyingGlassIcon size={36} aria-hidden="true" /><h3>No matching aircraft</h3><p>Try a model name, manufacturer, or a different cabin class.</p><button className="button button--dark" onClick={reset}>Show all aircraft</button></div>}
    </div>
    {view==="split" && <aside className={catalog.rail} aria-label="Aircraft selection">
      <p className={styles.kicker}>Illustrative range</p><h3>Compare aircraft</h3>
      <p>Select up to three aircraft. Published figures are for planning, not live fleet inventory or route availability.</p>
      {compared.length ? <><AircraftRangeMap profiles={compared.map(item => ({ ...item, rangeNm: getModel(item.slug)?.rangeNm, rangeBasis: getModel(item.slug)?.rangeBasis }))} /><ul>{compared.map(item=><li key={item.slug}><Link href={`/aircraft/${item.slug}`}>{item.name}</Link><button type="button" aria-label={`Remove ${item.name}`} onClick={()=>toggle(item.slug)}><XIcon size={16}/></button></li>)}</ul><a className={catalog.control} href="#aircraft-comparison">View range and specifications <ArrowRightIcon size={16}/></a></> : <Link className={catalog.control} href="/aircraft-comparisons/">Browse planning guides <ArrowRightIcon size={16}/></Link>}
    </aside>}
    </div>
    {compared.length > 0 && <aside className={styles.shortlistBar} aria-label="Selected aircraft">
      <span>{compared.length} of 3 selected</span>
      <a href="#aircraft-comparison">Compare aircraft <ArrowRightIcon size={16} aria-hidden="true" /></a>
      <button type="button" aria-label="Clear selected aircraft" onClick={() => setSelected([])}><XIcon size={20} aria-hidden="true" /></button>
    </aside>}
    {compared.length > 0 && <section id="aircraft-comparison" tabIndex={-1} className={styles.comparison} aria-labelledby="comparison-title">
      <div className={styles.heading}><div><p className={styles.kicker}>Side by side</p><h2 id="comparison-title">Your aircraft shortlist</h2><p>{compared.length === 1 ? "Select another aircraft to compare cabin and mission details." : "These are planning profiles. Confirm the exact tail, configuration and mission performance with your advisor."}</p></div><button className={styles.textButton} onClick={() => setSelected([])}>Clear comparison</button></div>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Aircraft comparison table"><table><caption className="sr-only">Aircraft planning profiles</caption><thead><tr><th scope="col">Compare</th>{compared.map(item => <th scope="col" key={item.slug}>{item.name}<button className={styles.remove} aria-label={`Remove ${item.name} from comparison`} onClick={() => toggle(item.slug)}><XIcon size={16} aria-hidden="true" /></button></th>)}</tr></thead><tbody>
        {([['Category', 'category'], ['Passengers', 'passengers'], ['Cabin', 'cabin']] as const).map(([label,key]) => <tr key={key}><th scope="row">{label}</th>{compared.map(item => <td key={item.slug}>{key === 'category' ? item.category : item.typical[key]}</td>)}</tr>)}
        {([['Published range', 'range'], ['Cabin height', 'height'], ['Cabin width', 'width'], ['Cabin length', 'length'], ['Baggage volume', 'baggage']] as const).map(([label,key]) => <tr key={key}><th scope="row">{label}</th>{compared.map(item => <td key={item.slug}>{references[item.slug]?.[key] ?? (key === 'range' ? item.typical.range : key === 'baggage' ? item.typical.baggage : getModel(item.slug)?.cabin?.[key] ?? 'Not verified for this profile')}</td>)}</tr>)}
        {models.length > 0 && <tr><th scope="row">Range assumptions</th>{compared.map(item => <td key={item.slug}>{getModel(item.slug)?.rangeBasis ?? "Source assumptions not listed"}</td>)}</tr>}
        {models.length > 0 && <tr><th scope="row">Published speed</th>{compared.map(item => <td key={item.slug}>{getModel(item.slug)?.maxSpeed ?? "Not verified for this profile"}</td>)}</tr>}
        {models.length > 0 && <tr><th scope="row">Published ceiling</th>{compared.map(item => <td key={item.slug}>{getModel(item.slug)?.ceiling ?? "Not verified for this profile"}</td>)}</tr>}
        {models.length > 0 && <tr><th scope="row">Specification source</th>{compared.map(item => { const source = getModel(item.slug)?.source; return <td key={item.slug}>{source ? <a href={source.url}>{source.label}</a> : "No verified specification source listed"}</td>; })}</tr>}
        <tr><th scope="row">Next step</th>{compared.map(item => <td key={item.slug}><Link href={`/aircraft/${item.slug}`}>View {item.name}</Link></td>)}</tr>
      </tbody></table></div>
      <AircraftRangeMap profiles={compared.map(item => ({ ...item, rangeNm: getModel(item.slug)?.rangeNm, rangeBasis: getModel(item.slug)?.rangeBasis }))} />
      <p className={styles.comparisonNote}>Published figures describe the aircraft model, not the available aircraft. Range assumptions differ by manufacturer; payload, reserves and conditions affect each mission. Review the model page for operating assumptions and representative layouts.</p>
      <Link className="button button--dark" href="/contact">Discuss your shortlist <ArrowRightIcon size={18} aria-hidden="true" /></Link>
    </section>}
  </section>;
}
