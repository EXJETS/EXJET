"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { aviationSolutions } from "@/data/site";
import styles from "./ServiceExplorer.module.css";
const groups = [
 {name:"Fly",title:"Your mission. Our focus.",copy:"Passenger and cargo capacity, arranged around your route, schedule and operating requirements.",image:"/images/manufacturers/longitude-mission.jpg",alt:"Cessna Citation Longitude in flight above clouds",paths:["/aircraft-charter","/dry-lease","/acmi","/empty-legs"]},
 {name:"Own",title:"A more personal approach.",copy:"From your first ownership decision to the everyday management of your aircraft.",image:"/images/manufacturers/falcon-8x-lounge.jpg",alt:"Representative Dassault Falcon 8X passenger lounge",paths:["/fractional","/ownership","/aircraft-management"]},
 {name:"Operate",title:"Expertise that goes further.",copy:"The people, technical knowledge and project coordination behind your aircraft.",image:"/images/manufacturers/falcon-8x-flightdeck.jpg",alt:"Dassault Falcon 8X flight deck",paths:["/crew","/engineering-stc","/mro","/interior-completions"]},
];
export function ServiceExplorer(){
 const [active,setActive]=useState(0);
 return <div className={styles.explorer}>
  <div className={styles.selector} role="group" aria-label="Explore service groups">{groups.map((group,i)=><button type="button" key={group.name} onClick={()=>setActive(i)} aria-pressed={active===i} aria-controls={`solution-${i}`}><span>0{i+1}</span>{group.name}</button>)}</div>
  {groups.map((group,i)=><div key={group.name} id={`solution-${i}`} hidden={active!==i} className={styles.panel}>
   <div className={styles.visual}><Image src={group.image} alt={group.alt} width={2000} height={1333} sizes="(max-width:760px) 100vw, 58vw" /></div>
   <div className={styles.copy}><h3>{group.title}</h3><p>{group.copy}</p><ul>{group.paths.map(path=>{const s=aviationSolutions.find(item=>item.path===path)!;return <li key={path}><Link href={path}><span>{s.name}{s.scope&&<small>{s.scope}</small>}</span><ArrowUpRightIcon size={20} aria-hidden="true" /></Link></li>})}</ul></div>
  </div>)}
 </div>;
}
