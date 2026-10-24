import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, ArrowDownIcon } from "@phosphor-icons/react/dist/ssr";
import { ServiceExplorer } from "@/components/ServiceExplorer";
import { HomeAircraftEditorial } from "@/components/HomeAircraftEditorial";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import styles from "./landing.module.css";
export const metadata = buildMetadata("/");
const audiences = [
 ["Executive & corporate travel", "/corporate-travel/fortune-500", "For the decisions that move your business."],
 ["Family offices & private clients", "/family-office-private-aviation", "A personal approach to every journey."],
 ["Sports, entertainment & groups", "/group-charter", "People, equipment and schedules. Together."],
 ["Aircraft owners & operators", "/aircraft-owners", "Expertise across the aircraft lifecycle."],
];
export default function Home() {
 return <div className={styles.landing}>
 <StructuredData data={localBusinessJsonLd()} />
 <section className={styles.hero} aria-labelledby="home-title">
  <Image className={styles.heroPhoto} src="/images/manufacturers/global-8000-clouds.webp" alt="Bombardier Global 8000 banking above the clouds" width={1440} height={978} sizes="100vw" preload />
  <div className={styles.heroCopy}><p className={styles.eyebrow}>EXJET · Business & commercial aviation</p><h1 id="home-title">Global Access.<br className={styles.mobileBreak} /> On-Demand.</h1></div>
  <div className={styles.heroBottom}><p>Aviation solutions.<br />Built around your world.</p><nav aria-label="Start with EXJET"><Link className={styles.pill} href="/charter">Find a flight <ArrowUpRightIcon size={18} /></Link><a className={styles.pill} href="#aviation-solutions">Explore our services <ArrowDownIcon size={18} /></a></nav></div>
 </section>
 <section className={styles.introduction}><p className={styles.eyebrow}>An aviation solutions company</p><h2>One relationship.<br />A world of expertise.</h2><p>From your next flight to your next aircraft. EXJET brings passenger and cargo capacity, ownership and technical support together for business and commercial aviation.</p><Link href="/about" className={styles.textLink}>Discover EXJET <ArrowUpRightIcon size={18} /></Link></section>
 <section id="aviation-solutions" className={styles.services}><header className={styles.sectionHeading}><p className={styles.eyebrow}>01 / Aviation solutions</p><h2>More possibilities.<br />At every stage.</h2><Link className={styles.textLink} href="/services">All eleven services <ArrowUpRightIcon size={18} /></Link></header><ServiceExplorer /></section>
 <section className={styles.collection}><header className={styles.sectionHeading}><p className={styles.eyebrow}>02 / Aircraft</p><h2>Find your perspective.</h2><Link className={styles.textLink} href="/aircraft">Explore the collection <ArrowUpRightIcon size={18} /></Link></header><HomeAircraftEditorial /></section>
 <section className={styles.cabin} aria-labelledby="cabin-title"><Image src="/images/manufacturers/falcon-8x-lounge.jpg" alt="Dassault Falcon 8X lounge with white leather seating and a walnut conference table" width={2000} height={1100} sizes="100vw" /><div className={styles.cabinCopy}><p className={styles.eyebrow}>03 / Interior completion</p><h2 id="cabin-title">Considered.<br />Down to the last detail.</h2><p>Cabin planning, materials and completion support. Shape an aircraft around the way you live and work.</p><Link className={styles.pill} href="/interior-completions">Explore interiors <ArrowUpRightIcon size={18} /></Link></div></section>
 <section className={styles.audiences}><div><p className={styles.eyebrow}>04 / Your world</p><h2>Personal by nature.<br />Global by design.</h2><p>Different priorities. One dedicated point of contact.</p></div><div className={styles.audienceList}>{audiences.map(([title,href,copy],i)=><Link key={href} href={href}><span className={styles.number}>0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRightIcon size={23} aria-hidden="true" /></Link>)}</div></section>
 <section className={styles.support}><div className={styles.supportPhoto}><Image src="/images/manufacturers/falcon-support.jpg" alt="Dassault manufacturer support team beside a Falcon aircraft" width={2000} height={1333} sizes="(max-width:760px) 100vw, 55vw" /></div><div><p className={styles.eyebrow}>05 / Beyond the flight</p><h2>The expertise<br />behind every mission.</h2><p>From crew sourcing and maintenance planning to engineering and STC coordination, keep your next requirement moving.</p><Link className={styles.pill} href="/mro">Service & repair <ArrowUpRightIcon size={18} /></Link><Link className={styles.textLink} href="/engineering-stc">Engineering & STC <ArrowUpRightIcon size={18} /></Link></div></section>
 <section className={styles.journal}><header className={styles.sectionHeading}><p className={styles.eyebrow}>The EXJET journal</p><h2>Before you go.</h2><Link className={styles.textLink} href="/travel-journal">Explore the journal <ArrowUpRightIcon size={18} /></Link></header><div className={styles.journalGrid}>{[["Aircraft knowledge","Know your aircraft.","Cabins, capabilities and the details that matter.","/aircraft-guides"],["Journey planning","A different way there.","Routes, airports and the possibilities between them.","/routes"],["Charter insight","The complete picture.","Understand the full quote before you fly.","/pricing"]].map(([k,t,c,h],i)=><Link href={h} key={h}><span>0{i+1} / {k}</span><h3>{t}</h3><p>{c}</p><ArrowUpRightIcon size={24} /></Link>)}</div></section>
 <section className={styles.contact}><p className={styles.eyebrow}>Your next chapter</p><h2>Where will it take you?</h2><div><Link className={styles.pill} href="/charter">Find a flight <ArrowUpRightIcon size={18} /></Link><Link className={styles.pill} href="/contact">Speak with EXJET <ArrowUpRightIcon size={18} /></Link></div><BrokerNotice /></section>
 </div>;
}
