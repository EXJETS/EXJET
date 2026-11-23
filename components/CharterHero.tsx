"use client";

import { useState } from "react";
import Image from "next/image";
import { BrowseFlightGlyph as Icon } from "./BrowseFlightGlyph";
import styles from "@/app/home-browse.module.css";

const slides = [
  ["/images/hero/bombardier-global-8000-coast.webp","Bombardier Global 8000 in flight over coastal waters","Global 8000","65% 55%"],
  ["/images/hero/gulfstream-g700-water.webp","Gulfstream G700 in flight over turquoise water","Gulfstream G700","68% 48%"],
  ["/images/hero/bombardier-challenger-3500-water.webp","Bombardier Challenger 3500 in flight over the coast","Challenger 3500","67% 52%"],
] as const;

export function CharterHero() {
  const [current,setCurrent]=useState(0);
  const [src,alt,model,position]=slides[current];
  function change(direction: number) {
    setCurrent((value)=>(value+direction+slides.length)%slides.length);
  }
  return <section className={styles.hero} aria-labelledby="home-title">
    <div className={styles.heroVisual}>
      <Image key={src} src={src} alt={alt} fill sizes="100vw" preload={current===0} loading={current===0?undefined:"eager"} className={styles.heroPhoto} style={{objectPosition:position}}/>
    </div>
    <div className={styles.heroInner}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><i/>Dallas based · Worldwide private charter</p>
        <h1 id="home-title">Charter a <br/>private jet<span>.</span></h1>
        <p>Choose your airports and dates. Compare aircraft and see a trip estimate before requesting a firm quote.</p>
      </div>
      <div className={styles.slides} aria-label="Aircraft photography">
        <span aria-live="polite">{model}</span>
        <button type="button" aria-label="Previous aircraft photo" onClick={()=>change(-1)}><Icon name="back" width="16" height="16"/></button>
        <button type="button" aria-label="Next aircraft photo" onClick={()=>change(1)}><Icon name="forward" width="16" height="16"/></button>
      </div>
    </div>
  </section>;
}
