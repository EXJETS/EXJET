import Link from "next/link";
import Image from "next/image";
import { AirplaneTiltIcon, UsersThreeIcon, HandshakeIcon, GaugeIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { aviationSolutions } from "@/data/site";
import { servicePhotos } from "@/data/service-photos";
import styles from "./ServicesGrid.module.css";

const icons = { empty: AirplaneTiltIcon, charter: AirplaneTiltIcon, lease: GaugeIcon, fractional: UsersThreeIcon, ownership: HandshakeIcon };

export function ServicesGrid({ compact = false }: { compact?: boolean }) {
  return <ul className={`${styles.grid}${compact ? ` ${styles.compact}` : ""}`}>{aviationSolutions.map(service => {
    const Icon = icons[service.icon];
    const photo = servicePhotos[service.path];
    return <li key={service.path}><Link href={service.path} className={`${styles.card}${photo ? ` ${styles.photoCard}` : ""}`}>
      {photo ? <div className={styles.photo}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 600px" /></div> : null}
      <div className={styles.copy}>
      <div className={styles.symbol}><span className={styles.icon}><Icon size={26} weight="regular" aria-hidden="true" /></span><ArrowUpRightIcon size={18} aria-hidden="true" /></div>
      <h3>{service.name}</h3>{service.scope ? <p className={styles.scope}>{service.scope}</p> : null}<p>{service.description}</p></div>
    </Link></li>;
  })}</ul>;
}
