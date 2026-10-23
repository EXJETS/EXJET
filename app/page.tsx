import Image from "next/image";
import Link from "next/link";
import { ServicesGrid } from "@/components/ServicesGrid";
import { HomeAircraftEditorial } from "@/components/HomeAircraftEditorial";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import styles from "./landing.module.css";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

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
  return (
    <div className={styles.landing}>
      <StructuredData data={localBusinessJsonLd()} />
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroVisual}>
          <Image className={styles.heroPhoto} src="/images/home/owner-selected-hero.webp" alt="Bombardier Global 8000 in flight over the ocean beside a coastline" width={1500} height={671} sizes="100vw" preload />
          <div className={styles.heroContent}>
            <h1 className={styles.tagline} id="home-title">Global Access. On-Demand.</h1>
          </div>
          <nav className={styles.heroActions} aria-label="Start with EXJET">
            <Link className={styles.heroAction} href="/charter">Find a flight <CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link>
            <Link className={styles.heroAction} href="/sales">Aircraft sales &amp; acquisitions <CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link>
          </nav>
        </div>
      </section>
      <section className={styles.servicesSection} aria-labelledby="services-title">
        <div className={styles.container}>
          <div className={styles.servicesIntro}>
            <div><p className={styles.eyebrow}>The EXJET approach</p><h2 id="services-title">One relationship.<br />Every stage of aviation.</h2></div>
            <div className={styles.servicesLead}><p>Private jet charter, empty leg flights and aircraft ownership advice. Explore five ways to fly with our Dallas-based team.</p><Link href="/services" className={styles.textAction}>Explore all services <CaretRightIcon size={16} aria-hidden="true" /></Link></div>
          </div>
          <ServicesGrid compact />
        </div>
      </section>
      <section className={styles.aircraftSection} id="aircraft" aria-labelledby="aircraft-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Explore the aircraft</p><h2 id="aircraft-title">The right aircraft for every journey.</h2></div>
          <Link className={styles.textAction} href="/aircraft">View the collection <CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link>
        </div>
        <HomeAircraftEditorial />
      </section>
      <section className={styles.experienceSection} id="experience" aria-labelledby="experience-title">
        <div className={styles.experienceIntro}>
          <p className={styles.eyebrow}>The EXJET experience</p>
          <h2 id="experience-title">Clear choices.<br /><span>One accountable relationship.</span></h2>
          <p>EXJET creates value through informed aircraft selection, thoughtful planning, and attentive support from request through arrival.</p>
        </div>
        <div className={styles.experienceCard}>
          <div className={styles.cabinImage}><Image src="/images/editorial/falcon-6x-club-seating.jpg" alt="Dassault Falcon 6X club seating with paired cream leather seats and wide cabin windows" width={1920} height={1281} sizes="(max-width: 1120px) 100vw, 1120px" /></div>
          <div className={styles.experienceDetails}>
            <div><h3>An aircraft selected with purpose.</h3><p>Compare the cabin, range, baggage capacity, and operating profile that matter to your mission.</p></div>
            <div><h3>A journey managed with care.</h3><p>Plan each detail with one EXJET contact who understands the full itinerary.</p></div>
            <Link className={styles.textAction} href="/why-exjet">Discover EXJET <CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <section className={styles.audienceSection} aria-labelledby="audience-title"><div className={styles.container}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Made for your priorities</p><h2 id="audience-title">For the people<br />behind the journey.</h2></div></div>
        <div className={styles.audienceGrid}>{audiences.map(item => <Link key={item.href} href={item.href} className={styles.audienceCard}><h3>{item.title}</h3><p>{item.copy}</p><span>Discover more <CaretRightIcon size={16} aria-hidden="true" /></span></Link>)}</div>
      </div></section>
      <section className={styles.planningSection} aria-labelledby="planning-title"><div className={styles.container}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Plan with confidence</p><h2 id="planning-title">A clearer view of private aviation.</h2></div><Link href="/how-it-works" className={styles.textAction}>How it works <CaretRightIcon size={16} aria-hidden="true" /></Link></div>
        <div className={styles.planningGrid}>{planningLinks.map(item => <Link key={item.href} href={item.href}><h3>{item.title}</h3><p>{item.copy}</p><CaretRightIcon size={18} aria-hidden="true" /></Link>)}</div>
        <aside className={styles.journalCallout} aria-labelledby="home-journal-title"><div><p className={styles.eyebrow}>The Travel Journal</p><h3 id="home-journal-title">Time away, well considered.</h3><p>Island escapes, alpine stays and cultural journeys. Find the place and the pace for your next holiday.</p></div><Link href="/travel-journal" className={styles.textAction}>Explore destinations & experiences <CaretRightIcon size={16} aria-hidden="true" /></Link></aside>
        <div className={styles.localLinks}><Link href="/private-jet-charter/dallas">Private jet charter in Dallas</Link><Link href="/safety">Our approach to safety</Link><Link href="/empty-legs">Explore empty legs</Link></div>
      </div></section>
      <section className={styles.bookingSection} aria-labelledby="booking-title">
        <p className={styles.eyebrow}>Wherever comes next.</p>
        <h2 id="booking-title">Move with clarity.</h2>
        <p>Share the journey. EXJET will guide the aircraft selection and coordinate the details.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/charter">Find a flight</Link>
          <Link className={styles.secondaryAction} href="/contact">Speak with EXJET <CaretRightIcon size={14} weight="light" aria-hidden="true" /></Link>
        </div>
        <BrokerNotice />
      </section>
    </div>
  );
}
