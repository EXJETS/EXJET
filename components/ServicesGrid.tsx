import Link from "next/link";
import Image from "next/image";
import { AirplaneTiltIcon, UsersThreeIcon, HandshakeIcon, GaugeIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { aviationSolutions } from "@/data/site";
import styles from "./ServicesGrid.module.css";

const icons = { empty: AirplaneTiltIcon, charter: AirplaneTiltIcon, lease: GaugeIcon, fractional: UsersThreeIcon, ownership: HandshakeIcon };

const servicePhotos: Record<keyof typeof icons, { src: string; alt: string }> = {
  empty: { src: "/images/manufacturers/challenger-350-flight.jpg", alt: "Bombardier Challenger 350 in flight" },
  charter: { src: "/images/manufacturers/global-8000-flight.webp", alt: "Bombardier Global 8000 in flight along a coastline" },
  lease: { src: "/images/manufacturers/g650-cabin.jpg", alt: "Representative Gulfstream G650 cabin" },
  fractional: { src: "/images/manufacturers/global-8000-club.webp", alt: "Representative Bombardier Global 8000 club suite" },
  ownership: { src: "/images/manufacturers/g650-flight.jpg", alt: "Gulfstream G650 in flight" },
};

export function ServicesGrid({ compact = false }: { compact?: boolean }) {
  return <ul className={`${styles.grid}${compact ? ` ${styles.compact}` : ""}`}>{aviationSolutions.map(service => {
    const Icon = icons[service.icon];
    const photo = servicePhotos[service.icon];
    return <li key={service.path}><Link href={service.path} className={`${styles.card}${photo ? ` ${styles.photoCard}` : ""}`}>
      {photo ? <div className={styles.photo}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 600px" /></div> : null}
      <div className={styles.copy}>
      <div className={styles.symbol}><span className={styles.icon}><Icon size={26} weight="regular" aria-hidden="true" /></span><ArrowUpRightIcon size={18} aria-hidden="true" /></div>
      <h3>{service.name}</h3><p>{service.description}</p></div>
    </Link></li>;
  })}</ul>;
}
