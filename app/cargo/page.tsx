import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
import { SectionIntro } from "@/components/SectionIntro";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";

export const metadata = buildMetadata("/cargo");

const freighters = [
  ["Boeing 737F", "Regional & narrow-body", "Efficient lift for regional lanes, time-critical parts, parcels, and general freight."],
  ["Airbus A321P2F", "Regional & narrow-body", "Containerized narrow-body capacity for high-frequency and medium-haul cargo missions."],
  ["Boeing 757F", "Medium-haul freighter", "A versatile option for express, automotive, industrial, and higher-volume regional movements."],
  ["Airbus A300F", "Wide-body freighter", "Main-deck cargo volume suited to pallets, outsized pieces, and established international lanes."],
  ["Boeing 767F", "Wide-body freighter", "Longer-range twin-engine cargo lift with broad operator availability across major markets."],
  ["Airbus A330F", "Wide-body freighter", "High-volume intercontinental capacity for planned or urgent long-range movements."],
  ["Boeing 747F", "Heavy & outsized", "Nose-loading capability on applicable variants for exceptional payloads and oversized cargo."],
  ["Boeing 777F", "Long-range heavy", "High-payload, long-range cargo lift for major intercontinental missions."],
];

export default function CargoPage() {
  return (
    <>
      <PageHero
        dark
        image="/images/cargo-charter-747.webp"
        imageAlt="Boeing 747 freighter being loaded on the apron at dusk"
        imageWidth={1672}
        imageHeight={941}
        eyebrow="Cargo charter"
        title={<>Cargo without<br /><em>compromise.</em></>}
        copy="Aircraft sourcing and charter coordination for time-sensitive, specialized, and mission-specific cargo movements worldwide."
      >
        <ButtonLink href="#cargo-request" variant="light">Request cargo capacity</ButtonLink>
      </PageHero>

      <section className="cargo-manifest">
        <div className="shell cargo-manifest__grid">
          <div><span>01</span><strong>Time-critical</strong><p>Responsive sourcing for schedules that cannot wait for standard freight lanes.</p></div>
          <div><span>02</span><strong>Specialized cargo</strong><p>Aircraft options curated around dimensions, weight, handling, and routing requirements.</p></div>
          <div><span>03</span><strong>Global coordination</strong><p>One point of contact across aircraft sourcing and trip logistics.</p></div>
        </div>
      </section>

      <section className="section cargo-aircraft-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Representative freighter access"
            title="From narrow-body lift to intercontinental heavy cargo."
            copy="EXJET brokers across the global cargo market. These are common examples, not a fixed fleet. The best aircraft is sourced around payload, dimensions, routing, loading method, timing, and availability."
          />
          <div className="cargo-aircraft-grid">
            {freighters.map(([name, category, copy], index) => (
              <article key={name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{category}</small><h3>{name}</h3></div>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <p className="form-disclaimer">Aircraft types shown are representative examples. EXJET does not own or exclusively control these aircraft. Final type, operator, payload, routing, permits, loading method, and availability are confirmed for each mission.</p>
        </div>
      </section>

      <section className="section page-form-section cargo-form-section" id="cargo-request">
        <div className="shell">
          <SectionIntro eyebrow="Request cargo capacity" title="Start with the shipment." copy="Provide the route, timing, dimensions, weight, and handling requirements. An EXJET advisor will assess the mission with qualified cargo operators." />
          <QuoteForm mode="cargo" />
          <p className="form-disclaimer">Cargo acceptance, routing, permits, handling, and aircraft availability are subject to operator review and applicable regulations. EXJET does not guarantee capacity until confirmed by the operating carrier.</p>
        </div>
      </section>

      <section className="section section--dark cargo-contact-section">
        <div className="shell split-copy split-copy--inverse">
          <p className="eyebrow eyebrow--light"><span />Direct cargo desk</p>
          <h2>Complex mission?<br />Start directly.</h2>
          <div>
            <a className="large-contact-link" href={`mailto:${siteConfig.email.cargo}`}>{siteConfig.email.cargo} <span>→</span></a>
            <a className="large-contact-link" href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display} <span>→</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
