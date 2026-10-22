import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import styles from "./FlightSearchLink.module.css";

export function FlightSearchLink({ title = "Planning a flight?", copy = "Choose your route, dates and passengers on our dedicated flight search page." }: { title?: string; copy?: string }) {
  return <section className={styles.panel}>
    <h2>{title}</h2><p>{copy}</p>
    <Link href="/charter" className="button button--dark">Find a flight <ArrowRightIcon size={18} aria-hidden="true" /></Link>
  </section>;
}
