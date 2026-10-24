import Image from "next/image";
import Link from "next/link";
import { ServiceExplorer } from "@/components/ServiceExplorer";
import { HomeAircraftEditorial } from "@/components/HomeAircraftEditorial";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import styles from "./landing.module.css";
export const metadata = buildMetadata("/");
const audiences = [
  { title: "Executive assistants", copy: "Coordinate executive schedules, preferences and last-minute changes with one point of contact.", href: "/executive-assistants" },
  { title: "Family offices", copy: "Private aviation planning shaped around your principals, family and ownership objectives.", href: "/family-office-private-aviation" },
  { title: "Fortune 500 teams", copy: "Charter planning for Fortune 500 teams, board travel and multi-city business itineraries.", href: "/corporate-travel/fortune-500" },
  { title: "Private clients", copy: "Discreet aircraft selection and itinerary planning for individuals, families and their guests.", href: "/private-jet-charter" },
  { title: "Sports agents & managers", copy: "Coordinate athletes, teams, equipment and event schedules with a clear travel brief.", href: "/group-charter/sports-teams" },
  { title: "Entertainment & event travel", copy: "Plan travel for artists, actors, musicians and their teams around productions, tours and major events.", href: "/group-charter" },
];
const planningLinks = [
  { title: "Routes & destinations", copy: "Explore your next journey.", href: "/routes" },
  { title: "Airports", copy: "Find the right arrival point.", href: "/airports" },
  { title: "Charter pricing", copy: "Understand the full quote.", href: "/pricing" },
  { title: "The Flight Guide", copy: "Get answers before you fly.", href: "/articles" },
];


export default function Home() {
 return <div className={styles.landing}>
  <StructuredData data={localBusinessJsonLd()} />
  <section className={styles.hero} aria-labelledby="home-title">
   <div className={styles.heroImage}><Image src="/images/home/owner-selected-hero.webp" alt="Bombardier Global 8000 in flight above a coastline" width={1500} height={671} sizes="100vw" preload /></div>
   <div className={styles.heroHeading}><p>Business aviation. Personally considered.</p><h1 id="home-title">Global Access. On-Demand.</h1></div>
   <nav className={styles.heroActions} aria-label="Start with EXJET"><Link href="/charter">Find a flight <span aria-hidden="true">↗</span></Link><Link href="/sales">Aircraft sales &amp; acquisitions <span aria-hidden="true">↗</span></Link></nav>
  </section>
  <section className={styles.statement}><p className={styles.eyebrow}>The EXJET perspective</p><h2>Your time.<br />A world of possibility.</h2><div><p>From a single journey to an ownership decision, one relationship brings clarity to your aviation plans.</p><Link className={styles.pill} href="/about">Discover EXJET <span aria-hidden="true">↗</span></Link></div></section>
  <section className={styles.services}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Five ways to fly</p><h2>Aviation, on your terms.</h2></div><ServiceExplorer /></section>
  <section className={styles.campaign} aria-labelledby="cabin-title"><Image src="/images/manufacturers/global-8000-club.webp" alt="Bombardier Global 8000 club suite with cream leather seating and panoramic windows" width={2700} height={1200} sizes="100vw" /><div className={styles.campaignCopy}><p className={styles.eyebrow}>The journey is yours</p><h2 id="cabin-title">Space to think.<br />Freedom to go.</h2><p>Choose the cabin, range and details that make the journey work for you.</p><Link className={styles.pill} href="/aircraft">Explore aircraft <span aria-hidden="true">↗</span></Link></div></section>
  <section className={styles.collection}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Aircraft collection</p><h2>Exceptional aircraft.<br />Individual possibilities.</h2><Link className={styles.pill} href="/aircraft">View all aircraft <span aria-hidden="true">↗</span></Link></div><HomeAircraftEditorial /></section>
  <section className={styles.audiences}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Your priorities, understood</p><h2>For the people<br />behind the journey.</h2></div><div className={styles.audienceGrid}>{audiences.map((item,index)=><Link href={item.href} key={item.title}><span className={styles.index}>{String(index+1).padStart(2,"0")}</span><h3>{item.title}</h3><p>{item.copy}</p><span className={styles.arrow} aria-hidden="true">↗</span></Link>)}</div></section>
  <section className={styles.journal}><div className={styles.journalPhoto}><Image src="/images/editorial/falcon-8x-flight-coast.jpg" alt="Dassault Falcon 8X above a Mediterranean coastline" width={1920} height={1080} sizes="(max-width:760px) 100vw, 50vw" /></div><div><p className={styles.eyebrow}>The Travel Journal</p><h2>The world,<br />at your pace.</h2><p>Island escapes, alpine stays and cultural journeys. Discover places worth making time for.</p><Link href="/travel-journal" className={styles.pill}>Explore the journal <span aria-hidden="true">↗</span></Link></div></section>
  <section className={styles.resources}><div className={styles.sectionHeading}><p className={styles.eyebrow}>A more informed journey</p><h2>Explore the details.</h2></div><div>{planningLinks.map(item=><Link href={item.href} key={item.href}><h3>{item.title}</h3><p>{item.copy}</p><span aria-hidden="true">↗</span></Link>)}</div><nav aria-label="More from EXJET"><Link href="/private-jet-charter/dallas">Private jet charter in Dallas</Link><Link href="/safety">Our approach to safety</Link><Link href="/services">All aviation services</Link></nav></section>
  <section className={styles.contact}><p className={styles.eyebrow}>Wherever comes next</p><h2>Let’s make it happen.</h2><div><Link className={styles.pill} href="/charter">Find a flight <span aria-hidden="true">↗</span></Link><Link className={styles.pill} href="/contact">Speak with EXJET <span aria-hidden="true">↗</span></Link></div><BrokerNotice /></section>
 </div>;
}
