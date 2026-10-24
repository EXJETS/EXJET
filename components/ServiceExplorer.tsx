"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { aviationSolutions } from "@/data/site";
import styles from "./ServiceExplorer.module.css";
const photos = [
  { src: "/images/manufacturers/challenger-350-flight.jpg", alt: "Bombardier Challenger 350 in flight" },
  { src: "/images/manufacturers/global-8000-flight.webp", alt: "Bombardier Global 8000 flying above a coastline" },
  { src: "/images/manufacturers/g650-cabin.jpg", alt: "Representative Gulfstream G650 cabin" },
  { src: "/images/manufacturers/global-8000-club.webp", alt: "Representative Bombardier Global 8000 club suite" },
  { src: "/images/manufacturers/g650-flight.jpg", alt: "Gulfstream G650 in flight" },
];
export function ServiceExplorer() {
  const [active, setActive] = useState(1);
  return <div className={styles.explorer}>
    <div className={styles.visual}><Image src={photos[active].src} alt={photos[active].alt} fill sizes="(max-width:760px) 100vw, 55vw" /><span>{String(active + 1).padStart(2,"0")} / 05</span></div>
    <div className={styles.options}>{aviationSolutions.map((service,index)=><div className={styles.option} key={service.path}>
      <h3><button type="button" aria-expanded={active===index} aria-controls={`service-panel-${index}`} onClick={()=>setActive(index)}>{service.name}<span aria-hidden="true">{active===index ? "−" : "+"}</span></button></h3>
      <div id={`service-panel-${index}`} hidden={active!==index}><p>{service.description}</p><Link href={service.path}>Explore {service.name.toLowerCase()} <span aria-hidden="true">↗</span></Link></div>
    </div>)}</div>
  </div>;
}
