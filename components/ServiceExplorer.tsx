"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { aviationSolutions } from "@/data/site";
import { servicePhotos } from "@/data/service-photos";
import styles from "./ServiceExplorer.module.css";
export function ServiceExplorer() {
  const [active, setActive] = useState(0);
  const photo = servicePhotos[aviationSolutions[active].path];
  return <div className={styles.explorer}>
    <div className={styles.visual}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width:760px) 100vw, 55vw" /><span>{String(active + 1).padStart(2,"0")} / {String(aviationSolutions.length).padStart(2,"0")}</span></div>
    <div className={styles.options}>{aviationSolutions.map((service,index)=><div className={styles.option} key={service.path}>
      <h3><button type="button" aria-expanded={active===index} aria-controls={`service-panel-${index}`} onClick={()=>setActive(index)}><span>{service.name}{service.scope ? <small>{service.scope}</small> : null}</span><span aria-hidden="true">{active===index ? "−" : "+"}</span></button></h3>
      <div id={`service-panel-${index}`} hidden={active!==index}><p>{service.description}</p><Link href={service.path}>Explore {service.name.toLowerCase()} <span aria-hidden="true">↗</span></Link></div>
    </div>)}</div>
  </div>;
}
