import Link from "next/link";
import { ContentCollection } from "@/components/EditorialPage";
import { buildMetadata } from "@/data/seo";
import { AircraftExplorer } from "@/components/AircraftExplorer";
import { directoryAircraft, modelSpecs } from "@/data/aircraft-directory";
import styles from "./aircraft-directory.module.css";

export const metadata = buildMetadata("/aircraft");
const cabins = [
  { name: "Midsize", seats: 8, ref: "midsize-jet" },
  { name: "Large", seats: 9, ref: "super-midsize-jet" },
  { name: "Heavy", seats: 13, ref: "heavy-jet" },
  { name: "Ultra long range", seats: 16, ref: "ultra-long-range-jet" },
];

export default function AircraftPage() {
  return <>
    <AircraftExplorer items={directoryAircraft} models={modelSpecs} />
    <section className={styles.cabins} aria-labelledby="cabin-index-title">
      <div className={styles.heading}><div><h2 id="cabin-index-title">Charter cabins</h2><p>Passenger counts are for planning. Confirm the specific aircraft before booking.</p></div><Link href="/charter/">Plan a flight</Link></div>
      <div className={styles.grid}>{cabins.map(cabin => <div key={cabin.ref} id={cabin.ref}><strong>{cabin.name}</strong><span>Up to {cabin.seats} passengers</span></div>)}</div>
    </section>
    <ContentCollection paths={["/aircraft-guides", "/aircraft-performance", "/aircraft-comparisons", "/guides/aircraft-tail-number-verification"]} title="Aircraft planning guides" description="Compare cabins and see what to verify before a flight." showImages={false} />
  </>;
}
