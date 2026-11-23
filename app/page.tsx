import Image from "next/image";
import Link from "next/link";
import { HomeBrowseRow } from "@/components/HomeBrowseRow";
import { QuoteForm } from "@/components/QuoteForm";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { CharterIcon } from "@/components/CharterVisuals";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import { charterCabinCategories, charterCapacityNote } from "@/data/charter-planning-rates";
import styles from "./home-browse.module.css";

export const metadata = buildMetadata("/");

const aircraft = [
  { name: "Gulfstream G700", detail: "Gulfstream · Ultra long range", slug: "gulfstream-g700", image: "/images/hero/gulfstream-g700-water.webp", position: "65% 38%" },
  { name: "Global 8000", detail: "Bombardier · Ultra long range", slug: "global-8000", image: "/images/hero/bombardier-global-8000-coast.webp", position: "47% 50%" },
  { name: "Challenger 3500", detail: "Bombardier · Super midsize", slug: "challenger-3500", image: "/images/hero/bombardier-challenger-3500-water.webp", position: "49% 46%" },
];

const routes = [
  { name: "Dallas to Aspen", detail: "DAL → ASE", href: "/routes/dallas-to-aspen/" },
  { name: "Dallas to New York", detail: "DAL → TEB", href: "/routes/dallas-to-new-york/" },
  { name: "Dallas to Miami", detail: "DAL → OPF", href: "/routes/dallas-to-miami/" },
];

const emptyLegOptions = [
  { title: "Explore empty legs", copy: "See how one way repositioning flights work.", href: "/empty-legs/" },
  { title: "Ask about a route", copy: "Tell us your airports and flexible travel dates.", href: "/contact/" },
  { title: "Need fixed dates?", copy: "Plan private jet charter around your itinerary.", href: "/charter/" },
];

export default function Home() {
  return <div className={styles.home}>
    <StructuredData data={localBusinessJsonLd()} />
    <section className={styles.hero} aria-labelledby="home-title">
      <Image src={aircraft[0].image} alt="" fill sizes="100vw" preload className={styles.heroPhoto} />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.heroInner}><div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Dallas based · Worldwide charter</p>
        <h1 id="home-title">Private jet<br />charter.</h1>
        <p>Plan a flight on your schedule, compare aircraft, or explore flexible empty legs.</p>
      </div></div>
    </section>

    <section id="plan-your-charter" className={styles.searchArea} aria-label="Plan your flight">
      <div className={styles.discovery}>
        <div className={styles.quote}><QuoteForm compact /><BrokerNotice className={styles.notice} /></div>
      </div>
    </section>

    <div className={styles.content}>
      <section className={styles.section} aria-labelledby="home-cabins">
        <header className={styles.heading}><h2 id="home-cabins">Find your cabin</h2><Link href="/aircraft/">Compare aircraft <span aria-hidden="true">↗</span></Link></header>
        <HomeBrowseRow label="cabin choices">
          {charterCabinCategories.map(([category, seats]) => <Link className={styles.card} key={category} href="/aircraft/"><CharterIcon className={styles.icon} name="aircraft" /><h3>{category}</h3><p>{seats} seats</p></Link>)}
        </HomeBrowseRow>
        <p className={styles.caption}>{charterCapacityNote}</p>
      </section>

      <section className={styles.section} aria-labelledby="home-aircraft">
        <header className={styles.heading}><div><h2 id="home-aircraft">Explore aircraft</h2><p>Model profiles, specifications and range maps.</p></div><Link href="/aircraft/">View all aircraft <span aria-hidden="true">↗</span></Link></header>
        <HomeBrowseRow label="aircraft profiles" photos>
          {aircraft.map(item => <Link key={item.slug} className={styles.photoCard} href={`/aircraft/${item.slug}/`}>
            <div className={styles.photo}><Image src={item.image} alt="" fill sizes="(max-width: 700px) 82vw, 40vw" style={{ objectPosition: item.position }} /></div>
            <div className={styles.photoCopy}><p>{item.detail}</p><h3>{item.name}</h3><span>View profile <span aria-hidden="true">↗</span></span></div>
          </Link>)}
        </HomeBrowseRow>
        <p className={styles.caption}>Illustrative model profiles, not available aircraft. Exact configuration and availability are confirmed for each trip.</p>
      </section>

      <section className={styles.section} aria-labelledby="home-routes">
        <header className={styles.heading}><div><h2 id="home-routes">Explore routes</h2><p>Start with a route from Dallas.</p></div><Link href="/routes/">View all routes <span aria-hidden="true">↗</span></Link></header>
        <HomeBrowseRow label="popular routes">{routes.map(route => <Link className={styles.card} key={route.href} href={route.href}><CharterIcon className={styles.icon} name="arrow" /><h3>{route.name}</h3><p>{route.detail}</p></Link>)}</HomeBrowseRow>
      </section>

      <section className={styles.section} aria-labelledby="home-emptylegs">
        <header className={styles.heading}><div><h2 id="home-emptylegs">Empty legs</h2><p>One way charter opportunities for flexible travelers.</p></div><Link href="/empty-legs/">View empty legs <span aria-hidden="true">↗</span></Link></header>
        <HomeBrowseRow label="empty leg options">{emptyLegOptions.map(option => <Link className={styles.card} key={option.href} href={option.href}><CharterIcon className={styles.icon} name="empty" /><h3>{option.title}</h3><p>{option.copy}</p></Link>)}</HomeBrowseRow>
        <p className={styles.caption}>Routes and availability can change. Confirm the aircraft, itinerary and terms before booking.</p>
      </section>

      <BrokerNotice className={styles.footerNotice} />
    </div>
  </div>;
}
