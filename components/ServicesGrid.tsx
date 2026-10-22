import Link from "next/link";
import Image from "next/image";
import { AirplaneTiltIcon, UsersThreeIcon, HandshakeIcon, GaugeIcon, WrenchIcon, ArmchairIcon, WifiHighIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { aviationSolutions } from "@/data/site";
import styles from "./ServicesGrid.module.css";

const icons = { charter: AirplaneTiltIcon, group: UsersThreeIcon, sales: HandshakeIcon, management: GaugeIcon, mro: WrenchIcon, interior: ArmchairIcon, connectivity: WifiHighIcon };

const servicePhotos: Partial<Record<keyof typeof icons, { src: string; alt: string }>> = {
  charter: { src: "/images/editorial/falcon-8x-flight-coast.jpg", alt: "Dassault Falcon 8X flying above a Mediterranean coastline" },
  group: { src: "/images/editorial/citation-longitude-cabin.jpg", alt: "Representative Citation Longitude cabin with facing leather seats" },
  sales: { src: "/images/manufacturers/g650-flight.jpg", alt: "Gulfstream G650 in flight" },
};

export function ServicesGrid({ compact = false }: { compact?: boolean }) {
  return <ul className={`${styles.grid}${compact ? ` ${styles.compact}` : ""}`}>{aviationSolutions.map(service => {
    const Icon = icons[service.icon];
    const photo = servicePhotos[service.icon];
    return <li key={service.path}><Link href={service.path} className={`${styles.card}${photo ? ` ${styles.photoCard}` : ""}`}>
      {photo ? <div className={styles.photo}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 400px" /></div> : null}
      <div className={styles.copy}>
      <div className={styles.symbol}><span className={styles.icon}><Icon size={26} weight="regular" aria-hidden="true" /></span><ArrowUpRightIcon size={18} aria-hidden="true" /></div>
      <h3>{service.name}</h3><p>{service.description}</p></div>
    </Link></li>;
  })}</ul>;
}
