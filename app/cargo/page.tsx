import { CharterJourney } from "@/components/CharterJourney";
import { ContentCollection } from "@/components/EditorialPage";
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
      <CharterJourney
        active="cargo"
        eyebrow="Air cargo charter"
        title="Request air cargo capacity."
        description="Source airlift for time-sensitive or specialist shipments. Give us the origin, destination and delivery window."
        panelId="cargo-request"
        panelTitle="Describe your shipment"
        panelDescription="Add dimensions, weight, loading requirements and any permits or handling needs in your notes."
        advisorTitle="Need help with a complex load?"
        advisorCopy="Send specifications to the cargo desk. Acceptance, routing, permits and aircraft availability are subject to operator review."
        links={[
          { href: `mailto:${siteConfig.email.cargo}`, label: "Email the cargo desk" },
          { href: "#cargo-aircraft", label: "Compare representative freighters" },
        ]}
      >
        <QuoteForm mode="cargo" />
      </CharterJourney>

      <section className="cargo-manifest">
        <div className="shell cargo-manifest__grid">
          <div><span>01</span><strong>Time-critical</strong><p>Responsive sourcing for schedules that cannot wait for standard freight lanes.</p></div>
          <div><span>02</span><strong>Specialized cargo</strong><p>Aircraft options curated around dimensions, weight, handling, and routing requirements.</p></div>
          <div><span>03</span><strong>Global coordination</strong><p>One point of contact across aircraft sourcing and trip logistics.</p></div>
        </div>
      </section>

      <section className="section cargo-aircraft-section" id="cargo-aircraft">
        <div className="shell">
          <SectionIntro
            eyebrow="Representative freighter access"
            title="From narrow-body lift to intercontinental heavy cargo."
            copy="EXJET sources options across the global cargo market. These are common examples, not a fixed fleet. The best aircraft is sourced around payload, dimensions, routing, loading method, timing, and availability."
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
          <p className="form-disclaimer">Aircraft types shown are representative examples. EXJET does not own or exclusively control these aircraft. Final type, operator, payload, routing, permits, loading method, and availability are confirmed for each mission. EXJET does not guarantee capacity until confirmed by the operating carrier.</p>
        </div>
      </section>

      <section className="section section--dark cargo-contact-section">
        <div className="shell split-copy split-copy--inverse">
          <p className="eyebrow eyebrow--light"><span />Direct cargo desk</p>
          <h2>Complex mission?<br />Start directly.</h2>
          <div>
            <a className="large-contact-link" href={`mailto:${siteConfig.email.cargo}`}>{siteConfig.email.cargo} <span>→</span></a>
          </div>
        </div>
      </section>
      <ContentCollection paths={["/cargo/dallas"]} title="Dallas cargo charter." description="Plan an urgent or specialist shipment from the Dallas–Fort Worth region." showImages={false} />
    </>
  );
}
