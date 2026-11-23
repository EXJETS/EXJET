import { ContentCollection } from "@/components/EditorialPage";
import { AircraftCategoryCard } from "@/components/AircraftCategoryCard";
import { ButtonLink } from "@/components/ButtonLink";
import styles from "@/components/PublicAircraftMarket.module.css";
import catalog from "@/components/AircraftCatalog.module.css";
import { SectionIntro } from "@/components/SectionIntro";
import { aircraftCategories } from "@/data/aircraftCategories";
import { buildMetadata } from "@/data/seo";
import { AircraftExplorer } from "@/components/AircraftExplorer";
import { directoryAircraft, modelSpecs } from "@/data/aircraft-directory";

export const metadata = buildMetadata("/aircraft");

export default function AircraftPage() {
  return (
    <>
      <header className={catalog.mast}><div className={styles.wrap}>
        <p className={styles.label}>Charter aircraft directory</p>
        <h1>Explore aircraft</h1>
        <p>Find a model, compare cabin and published range, then discuss your route. These are planning profiles, not live inventory.</p>
      </div></header>
      <AircraftExplorer items={directoryAircraft} models={modelSpecs} />
      <section className="aircraft-category-index section">
        <div className="shell">
          <SectionIntro
            eyebrow="Browse by category"
            title="Charter aircraft categories"
            copy="Compare seating and cabin space."
          />
          <nav className="aircraft-category-jump" aria-label="Aircraft categories">
            {aircraftCategories.map((item, index) => (
              <a href={`#${item.slug}`} key={item.slug}><span>{String(index + 1).padStart(2, "0")}</span>{item.shortName}</a>
            ))}
          </nav>
        </div>
      </section>
      <section className="aircraft-category-list">
        <div className="shell">
          {aircraftCategories.map((item, index) => <AircraftCategoryCard item={item} index={index} key={item.slug} />)}
        </div>
      </section>
      <ContentCollection paths={["/aircraft-guides", "/aircraft-performance", "/aircraft-comparisons", "/guides/aircraft-tail-number-verification"]} title="Compare the details that matter." description="Performance, cabin choices and aircraft verification for your mission." showImages={false} />
      <section className="aircraft-category-advisor section section--dark">
        <div className="shell split-copy">
          <p className="eyebrow eyebrow--light"><span />Not sure where to begin?</p>
          <h2>Find the right aircraft</h2>
          <div>
            <p>Share your route and passenger count with an advisor.</p>
            <ButtonLink href="/contact" variant="light">Ask an advisor</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
