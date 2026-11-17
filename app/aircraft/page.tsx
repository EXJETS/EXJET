import { ContentCollection } from "@/components/EditorialPage";
import { AircraftCategoryCard } from "@/components/AircraftCategoryCard";
import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { aircraftCategories } from "@/data/aircraftCategories";
import { buildMetadata } from "@/data/seo";
import { AircraftExplorer } from "@/components/AircraftExplorer";
import { aircraft } from "@/data/aircraft";
import { getAircraftComparison } from "@/data/aircraft-reference";

export const metadata = buildMetadata("/aircraft");

export default function AircraftPage() {
  return (
    <>
      <PageHero heading="Explore business aircraft" eyebrow="Aircraft categories" title={<>The right class.<br /><em>The right fit.</em></>} copy="Compare cabin classes and passenger capacity. Your advisor confirms availability, configuration and suitability for your route." />
      <AircraftExplorer items={aircraft} references={Object.fromEntries(aircraft.map(item => [item.slug, getAircraftComparison(item.slug)]))} />
      <section className="aircraft-category-index section">
        <div className="shell">
          <SectionIntro
            eyebrow="Browse by category"
            title="More choice, without turning the trip into a catalog search."
            copy="These customer-facing categories simplify the aircraft landscape. Actual availability, model, configuration, range, baggage capacity, and amenities are confirmed with every charter option."
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
          <h2>Give us the mission. We will narrow the field.</h2>
          <div>
            <p>Route, passenger count, baggage, airport constraints, schedule, and cabin priorities all shape the right recommendation. Your EXJET advisor can compare categories and individual aircraft before presenting the strongest available options.</p>
            <ButtonLink href="/contact" variant="light">Ask an advisor</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
