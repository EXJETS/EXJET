"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./HomeHeroSlides.module.css";

export type HeroSlide = { src: string; label: string; description: string; href: string; position?: string };

export function HomeHeroSlides({ slides }: { slides: readonly HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const shift = (delta: number) => setIndex((current) => (current + delta + slides.length) % slides.length);
  const slide = slides[index];
  return <div className={styles.gallery} role="group" aria-label="Featured aircraft photos"
    onTouchStart={(event) => {
      const point = event.touches[0];
      touch.current = point && event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
    }}
    onTouchEnd={(event) => {
      const start = touch.current;
      const point = event.changedTouches[0];
      touch.current = null;
      if (!point || !start) return;
      const dx = point.clientX - start.x;
      const dy = point.clientY - start.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > 1.5 * Math.abs(dy)) shift(dx < 0 ? 1 : -1);
    }}
    onTouchCancel={() => { touch.current = null; }}
  >
    <figure className={styles.visual}>
      <Image key={slide.src} className={styles.photo} src={slide.src} alt={slide.description} fill sizes="100vw" preload={index === 0} style={{ objectPosition: slide.position ?? "center" }} draggable={false} />
    </figure>
    <span className={styles.shade} aria-hidden="true" />
    <div className={styles.copy}>
      <h1 id="home-title">{index === 0 ? "Private jet charter" : slide.label}</h1>
      <div className={styles.actions}>
        <a className={styles.primary} href="#plan-your-charter">Plan a flight</a>
        <Link className={styles.secondary} href={slide.href}>{slide.href === "/aircraft/" ? "Explore aircraft" : "View aircraft"}</Link>
      </div>
    </div>
    <div className={styles.controls} aria-label="Choose an aircraft photo">
      <button type="button" className={styles.arrow} aria-label="Previous aircraft photo" onClick={() => shift(-1)}>‹</button>
      {slides.map((item, i) => <button key={item.src} className={styles.dot} type="button" aria-label={`Show ${item.label} photo`} aria-pressed={index === i} onClick={() => setIndex(i)}><span /></button>)}
      <button type="button" className={styles.arrow} aria-label="Next aircraft photo" onClick={() => shift(1)}>›</button>
    </div>
    <span className={styles.sr} role="status">{slide.label}, photo {index + 1} of {slides.length}</span>
  </div>;
}
