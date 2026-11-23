"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CharterIcon as Icon } from "./CharterVisuals";
import type { FleetCategory } from "@/lib/charter-fleet";
import styles from "./CharterAircraftCards.module.css";

type Card = {
  id: string; tail: string; modelSlug: string; name: string; category: FleetCategory; categoryLabel: string;
  image: string | null; fit: "cover" | "contain"; seats?: number;
};
type Catalog = { floating: Card[]; based: Card[] };
export type AircraftPreference = { id: string; tail: string; modelSlug: string; name: string; category: FleetCategory };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function CharterAircraftCards({ airport, passengers, totals, onSelect, selected }: {
  airport: string; passengers: number;
  totals?: Record<string, number>;
  selected?: AircraftPreference | null;
  onSelect: (selection: AircraftPreference) => void;
}) {
  const key = new URLSearchParams({ airport, passengers: String(passengers) }).toString();
  const [lookup, setLookup] = useState<{ key: string; catalog?: Catalog }>();
  const [limits, setLimits] = useState<Record<string, number>>({});
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { setLookup({ key }); controller.abort(); }, 7000);
    fetch(`/api/charter-aircraft/?${key}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Aircraft request failed");
      const catalog = await response.json() as Catalog;
      if (!controller.signal.aborted) setLookup({ key, catalog });
    }).catch(() => { if (!controller.signal.aborted) setLookup({ key }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [key]);

  const catalog = lookup?.key === key ? lookup.catalog : undefined;
  const group = (kind: string, heading: string, cards: Card[]) => {
    if (!cards.length) return null;
    const sectionKey = `${key}:${kind}`;
    const limit = limits[sectionKey] ?? 6;
    return <section className={styles.group} aria-label={heading}>
      <h4>{heading}</h4>
      <ul className={styles.grid}>
        {cards.slice(0, limit).map(card => {
          const isSelected = selected?.id === card.id;
          const amount = totals?.[card.category];
          const seats = card.seats;
          return <li key={card.id}>
            <button className={styles.card} type="button" aria-pressed={isSelected}
              onClick={() => onSelect({ id: card.id, tail: card.tail, modelSlug: card.modelSlug, name: card.name, category: card.category })}>
              <span className={styles.photo}>
                {card.image ? <Image src={card.image} alt="" fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" style={{objectFit: card.fit}} />
                  : <Icon name="aircraft" width={44} height={44} />}
                {card.image && <span className={styles.photoLabel}>Model photo</span>}
              </span>
              <span className={styles.info}>
                <strong>{card.name}</strong>
                <small>{card.tail} · {card.categoryLabel}{seats ? ` · ${card.seats ? "" : "Up to "}${seats} seats` : ""}</small>
                <span className={styles.price}>{amount ? <>{usd.format(amount)} <small>estimated trip total</small></> : "Request pricing"}</span>
                <span className={styles.action}>{isSelected ? "Selected" : "Select aircraft"}</span>
              </span>
            </button>
          </li>;
        })}
      </ul>
      {cards.length > limit ? <button type="button" className={styles.more} onClick={() => setLimits(previous => ({ ...previous, [sectionKey]: limit + 12 }))}>Show more aircraft</button> : null}
    </section>;
  };
  const hasListings = Boolean(catalog && (catalog.floating.length || catalog.based.length));
  return <div className={styles.catalog}>
    {lookup?.key !== key ? <p role="status">Finding aircraft options…</p> : !catalog ? <p role="status">Aircraft listings could not load. You can still continue to request a quote.</p> : <>
      {group("floating", "Floating fleet", catalog.floating)}
      {group("based", `Based at ${airport}`, catalog.based)}
      {!hasListings ? <p className={styles.notice}>No aircraft are listed at this departure airport yet. Ask the charter desk to source your flight.</p> : null}
      {hasListings ? <p className={styles.notice}>Photos are representative. Prices are cabin estimates. The operator confirms aircraft, airport suitability and availability for your dates.</p> : null}
    </>}
  </div>;
}
