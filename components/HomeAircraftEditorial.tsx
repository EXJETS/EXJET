"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import styles from "./HomeAircraftEditorial.module.css";
type AircraftPreviewData = { maker: string; name: string; slug: string; exterior: string; interior?: string };
const aircraft: AircraftPreviewData[] = [
  { maker: "Cessna", name: "Citation Latitude", slug: "citation-latitude", exterior: "/images/manufacturers/latitude-header-new.jpg", interior: "/images/manufacturers/latitude-interior-new.jpg" },
  { maker: "Dassault", name: "Falcon 900LX", slug: "falcon-900", exterior: "/images/manufacturers/falcon-900lx-flight.jpg", interior: "/images/manufacturers/falcon-900lx-cabin.jpg" },
  { maker: "Gulfstream", name: "G650", slug: "gulfstream-g650", exterior: "/images/manufacturers/g650-flight.jpg", interior: "/images/manufacturers/g650-cabin.jpg" },
  { maker: "Bombardier", name: "Challenger 350", slug: "challenger-350", exterior: "/images/manufacturers/challenger-350-flight.jpg" },
];
function AircraftPreview({ aircraft: item }: { aircraft: typeof aircraft[number] }) {
  const [scene, setScene] = useState<"exterior" | "interior">("exterior");
  return <article className={styles.card} aria-labelledby={`${item.slug}-title`}>
    <div className={styles.cardCopy}><p>{item.maker}</p><h3 id={`${item.slug}-title`}>{item.name}</h3>
      <Link className={styles.cardAction} href={`/aircraft/${item.slug}`}>Explore aircraft <CaretRightIcon size={14} aria-hidden="true" /></Link>
    </div>
    <div className={styles.image} data-scene={scene}><Image src={item[scene] ?? item.exterior} alt={`${item.name} ${scene === "exterior" ? "in flight" : "passenger cabin"}`} fill sizes="(max-width: 760px) 100vw, (max-width: 1280px) 50vw, 588px" /></div>
    <div className={styles.sceneControls} role="group" aria-label={`${item.name} photo view`}>
      {(item.interior ? (["exterior", "interior"] as const) : (["exterior"] as const)).map(value => <button type="button" key={value} aria-pressed={scene === value} onClick={() => setScene(value)}><span>{value === "exterior" ? "Exterior" : "Interior"}</span></button>)}
    </div>
  </article>;
}
export function HomeAircraftEditorial() {
  return <div className={styles.collection}>
    <div className={styles.track}>{aircraft.map(item => <AircraftPreview key={item.slug} aircraft={item} />)}</div>
    <p className={styles.note}>Aircraft and cabins shown are representative. Your EXJET advisor confirms availability and the final quote.</p>
  </div>;
}
