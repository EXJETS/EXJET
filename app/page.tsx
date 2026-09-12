import Image from "next/image";
import Link from "next/link";
import { HomeAircraftEditorial } from "@/components/HomeAircraftEditorial";
import { ContentCollection } from "@/components/EditorialPage";
import { BrokerNotice } from "@/components/BrokerNotice";
import { articlePaths, routePaths } from "@/data/editorial";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import styles from "./landing.module.css";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata = buildMetadata("/");

export default function Home() {
  return (
    <div className={styles.landing}>
      <StructuredData data={localBusinessJsonLd()} />
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Private jet charter</p>
          <h1 id="home-title">Global Access.<br /><span>On-Demand.</span></h1>
          <p className={styles.heroDescription}>EXJET simplifies business aviation through clear access, informed guidance, and service built around every journey.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/charter">Find a flight</Link>
            <Link className={styles.secondaryAction} href="#aircraft">Explore aircraft <CaretRightIcon size={14} weight="light" aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image src="/images/home/owner-selected-hero.webp" alt="Bombardier Global 8000 in flight over the ocean beside a coastline" width={1500} height={671} sizes="(max-width: 1400px) 100vw, 1400px" priority />
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
      <ContentCollection paths={routePaths} title="Wherever comes next." description="A closer look at the airports and details behind your itinerary." silver />
      <ContentCollection paths={articlePaths.slice(0, 3)} title="A clearer view of private aviation." description="The EXJET Flight Guide. Practical reading for the journey ahead." showImages={false} />
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
