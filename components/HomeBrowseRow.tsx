"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "@/app/home-browse.module.css";

export function HomeBrowseRow({ label, children, photos = false }: { label: string; children: ReactNode; photos?: boolean }) {
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const row = rail.current;
    if (!row) return;
    const measure = () => {
      const start = row.scrollLeft < 2;
      const end = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
      setEdges(current => current.start === start && current.end === end ? current : { start, end });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    row.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => { row.removeEventListener("scroll", measure); observer.disconnect(); };
  }, []);
  const move = (direction: 1 | -1) => {
    const row = rail.current;
    if (!row) return;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const distance = (row.firstElementChild?.getBoundingClientRect().width ?? row.clientWidth) + gap;
    row.scrollBy({ left: distance * direction, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className={styles.rowShell}>
    {!(edges.start && edges.end) && <div className={styles.rowButtons}>
      <button type="button" aria-label={`Previous ${label}`} aria-controls={id} disabled={edges.start} onClick={() => move(-1)}><ArrowLeftIcon size={18} aria-hidden="true" /></button>
      <button type="button" aria-label={`Next ${label}`} aria-controls={id} disabled={edges.end} onClick={() => move(1)}><ArrowRightIcon size={18} aria-hidden="true" /></button>
    </div>}
    <div ref={rail} id={id} tabIndex={0} role="region" aria-label={label} className={`${styles.row} ${photos ? styles.photoRow : ""}`}>{children}</div>
  </div>;
}
