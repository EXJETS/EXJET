import Link from "next/link";
import { AirplaneTiltIcon, UsersThreeIcon, HandshakeIcon, GaugeIcon, WrenchIcon, ArmchairIcon, WifiHighIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { aviationSolutions } from "@/data/site";
import styles from "./ServicesGrid.module.css";

const icons = { charter: AirplaneTiltIcon, group: UsersThreeIcon, sales: HandshakeIcon, management: GaugeIcon, mro: WrenchIcon, interior: ArmchairIcon, connectivity: WifiHighIcon };

export function ServicesGrid() {
  return <ul className={styles.grid}>{aviationSolutions.map(service => {
    const Icon = icons[service.icon];
    return <li key={service.path}><Link href={service.path} className={styles.card}>
      <div className={styles.symbol}><Icon size={28} weight="light" aria-hidden="true" /><ArrowUpRightIcon size={18} aria-hidden="true" /></div>
      <h3>{service.name}</h3><p>{service.description}</p>
    </Link></li>;
  })}</ul>;
}
