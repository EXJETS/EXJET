import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import styles from "./HomeAircraftEditorial.module.css";
const aircraft=[
 {maker:"Bombardier",name:"Global 8000",slug:"global-8000",category:"Ultra-long-range",range:"8,000 nm",exterior:"/images/manufacturers/global-8000-clouds.webp"},
 {maker:"Cessna",name:"Citation Longitude",slug:"citation-longitude",category:"Super-midsize",range:"3,500 nm",exterior:"/images/manufacturers/longitude-mission.jpg"},
 {maker:"Dassault",name:"Falcon 900LX",slug:"falcon-900",category:"Large cabin",range:"4,750 nm",exterior:"/images/manufacturers/falcon-900lx-coast.jpg"},
];
export function HomeAircraftEditorial() {
 return <div className={styles.collection}>
  <ul className={styles.grid}>
   {aircraft.map(item => <li key={item.slug} className={styles.card}>
    <Link href={`/aircraft/${item.slug}/`} aria-label={`Explore the ${item.name}`}>
     <div className={styles.image}>
      <Image src={item.exterior} alt="" fill sizes="(max-width: 660px) 100vw, (max-width: 1050px) 50vw, 33vw" />
     </div>
     <div className={styles.copy}>
      <p>{item.maker} · {item.category}</p>
      <h3>{item.name}</h3>
      <div className={styles.range}><span>Published range <strong>{item.range}</strong></span><ArrowUpRightIcon size={22} aria-hidden="true" /></div>
     </div>
    </Link>
   </li>)}
  </ul>
  <p className={styles.note}>Range depends on payload and operating conditions; availability and configuration are confirmed for each trip.</p>
 </div>;
}
