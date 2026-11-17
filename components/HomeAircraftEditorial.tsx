"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import styles from "./HomeAircraftEditorial.module.css";
const aircraft=[
 {maker:"Bombardier",name:"Global 8000",slug:"global-8000",category:"Ultra-long-range",range:"8,000 nm",exterior:"/images/manufacturers/global-8000-clouds.webp",interior:"/images/manufacturers/global-8000-entertainment.jpg"},
 {maker:"Cessna",name:"Citation Longitude",slug:"citation-longitude",category:"Super-midsize",range:"3,500 nm",exterior:"/images/manufacturers/longitude-mission.jpg",interior:"/images/manufacturers/longitude-glacier.jpg"},
 {maker:"Dassault",name:"Falcon 900LX",slug:"falcon-900",category:"Large cabin",range:"4,750 nm",exterior:"/images/manufacturers/falcon-900lx-coast.jpg",interior:"/images/manufacturers/falcon-900lx-cabin-new.jpg"},
];
export function HomeAircraftEditorial(){
 const [selected,setSelected]=useState(0);const [scene,setScene]=useState<"exterior"|"interior">("exterior");const item=aircraft[selected];
 return <div className={styles.collection}>
  <div className={styles.modelControls} role="group" aria-label="Featured aircraft">{aircraft.map((a,i)=><button type="button" key={a.slug} onClick={()=>{setSelected(i);setScene("exterior")}} aria-pressed={selected===i} aria-controls="featured-aircraft">{a.name}</button>)}</div>
  <article id="featured-aircraft" className={styles.feature} aria-label={item.name}>
   <div className={styles.image}><Image key={item[scene]} src={item[scene]} alt={`${item.name} ${scene==="exterior"?"in flight":"passenger cabin"}`} width={1440} height={978} sizes="(max-width:760px) 100vw, 65vw" /></div>
   <div className={styles.copy}><p>{item.maker} · {item.category}</p><h3>{item.name}</h3><div className={styles.range}><span>Published maximum range</span><strong>{item.range}</strong></div><Link href={`/aircraft/${item.slug}`} className="button button--dark">Discover the aircraft <ArrowUpRightIcon size={18} /></Link><div className={styles.sceneControls} role="group" aria-label={`${item.name} photo view`}>{(["exterior","interior"] as const).map(s=><button key={s} type="button" onClick={()=>setScene(s)} aria-pressed={scene===s}>{s==="exterior"?"Exterior":"Interior"}</button>)}</div></div>
  </article><p className={styles.note}>Range depends on payload and operating conditions; availability and configuration are confirmed for each trip.</p>
 </div>;
}
