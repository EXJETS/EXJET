"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import type { EmptyLeg } from "@/data/emptyLegs";
import styles from "./Explore.module.css";

export function EmptyLegResults({ items, onRequest }: { items: EmptyLeg[]; onRequest: (item: EmptyLeg) => void }) {
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState("date");
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const categories = [...new Set(items.map(item => item.aircraftCategory))].sort();
  const savedItems = items.filter(item => shortlist.includes(item.id));
  const visible = items.filter(item => (!category || item.aircraftCategory === category) && (!onlySaved || shortlist.includes(item.id)))
    .sort((a, b) => order === "seats" ? (b.seats ?? 0) - (a.seats ?? 0) : a.departureDate.localeCompare(b.departureDate));
  const toggle = (id: string) => setShortlist(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);

  return <section className={styles.legResults} aria-label="Empty-leg search results">
    <div className={styles.toolbar}>
      <label className={styles.select}><span>Cabin class</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">All cabins</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className={styles.select}><span>Sort by</span><select value={order} onChange={event => setOrder(event.target.value)}><option value="date">Soonest departure</option><option value="seats">Most seats</option></select></label>
      <button className={styles.shortlistToggle} type="button" aria-pressed={onlySaved} onClick={() => setOnlySaved(current => !current)}><HeartIcon size={19} weight={onlySaved ? "fill" : "regular"} aria-hidden="true" />Shortlist ({savedItems.length})</button>
    </div>
    <p className={styles.resultCount} role="status">{visible.length} {visible.length === 1 ? "opportunity" : "opportunities"}. Shortlists last for this visit only.</p>
    <div className={styles.legGrid}>{visible.map(item => <article className={styles.legCard} key={item.id}>
      <div className={styles.legTop}><span className={styles.kicker}>{item.aircraftCategory}</span><button className={styles.saveLeg} type="button" aria-label={`${shortlist.includes(item.id) ? "Remove" : "Save"} ${item.departureAirport} to ${item.arrivalAirport} on ${item.departureDate}`} aria-pressed={shortlist.includes(item.id)} onClick={() => toggle(item.id)}><HeartIcon size={22} weight={shortlist.includes(item.id) ? "fill" : "regular"} aria-hidden="true" /></button></div>
      <div className={styles.legRoute}><div><h3>{item.departureAirport}</h3><p>{item.departureCity}</p></div><ArrowRightIcon size={24} aria-label="to" /><div><h3>{item.arrivalAirport}</h3><p>{item.arrivalCity}</p></div></div>
      <dl className={styles.legFacts}><div><dt>Departure</dt><dd>{item.departureDate}</dd></div><div><dt>Time</dt><dd>{item.departureWindow || "On request"}</dd></div><div><dt>Aircraft</dt><dd>{item.aircraftModel || item.aircraftCategory}</dd></div><div><dt>Capacity</dt><dd>{item.seats ? `Up to ${item.seats} seats` : "Confirm with advisor"}</dd></div></dl>
      <div className={styles.legBottom}><p>{item.priceNote || "Price on request"}</p><button className="button button--dark" type="button" onClick={() => onRequest(item)}>Request this leg <ArrowRightIcon size={18} aria-hidden="true" /></button></div>
    </article>)}</div>
    {!visible.length && <div className={styles.empty}><h3>{onlySaved ? "No flights in this shortlist" : "No flights match this cabin filter"}</h3><p>Browse the returned opportunities and use the heart to build a shortlist.</p><button className="button button--dark" type="button" onClick={() => { setCategory(""); setOnlySaved(false); }}>Show all opportunities</button></div>}
  </section>;
}
