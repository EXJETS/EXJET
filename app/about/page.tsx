import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { SocialLinks } from "@/components/SocialLinks";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";
import { publishedPilotCredentials } from "@/data/trust";

export const metadata = buildMetadata("/about");

const values = [
  ["01", "Safety", "Every mission begins with operator and aircraft review. Commercial pressure never outranks the requirements of a safe, compliant flight."],
  ["02", "Integrity", "Clear roles, honest communication, and written terms that clients can understand before they commit."],
  ["03", "Excellence", "Details are managed with the discipline expected from a dedicated flight department, from aircraft selection through arrival."],
  ["04", "Passion", "Aviation knowledge matters, but genuine care for the people and purpose behind each trip is what makes the service personal."],
];

export default function AboutPage() {
  return <>
    <PageHero dark eyebrow="About EXJET" title={<>Business aviation,<br /><em>made clear.</em></>} copy="EXJET exists to simplify business aviation and create value through broad aircraft access, informed guidance, and one accountable relationship." />
    <section className="section about-story"><div className="shell"><SectionIntro eyebrow="Our story" title="Built from the flight deck outward." copy="EXJET was founded by two pilots who understand that a successful charter is more than an aircraft and a departure time. It is an operational mission, a client experience, and a responsibility to get every detail right." /><div className="about-story-grid"><div className="about-story__image"><Image src="/images/editorial/citation-latitude-flight-deck.jpg" alt="Cessna Citation Latitude flight deck with instrument displays and dual pilot controls" fill sizes="(max-width: 820px) 92vw, 54vw" /></div><div className="about-story-grid__copy"><p>That perspective shapes how we evaluate aircraft, communicate with operators, anticipate operational constraints, and support the people on board. We look at each trip from the traveler&apos;s seat, the cockpit, the operator&apos;s dispatch desk, and the broker&apos;s responsibility to keep the mission connected.</p><p>We do not ask clients to sort through an endless list of aircraft. We ask the questions that change the answer: schedule, runway, range, baggage, cabin priorities, ground coordination, and the people who need to arrive ready.</p><dl><div><dt>Founders</dt><dd>Two pilots</dd></div><div><dt>Published certificate</dt><dd>{publishedPilotCredentials.certificate}</dd></div><div><dt>Published type ratings</dt><dd>{publishedPilotCredentials.typeRatings.join(" · ")}</dd></div><div><dt>Base</dt><dd>Dallas, Texas</dd></div><div><dt>Model</dt><dd>Charter broker</dd></div></dl></div></div></div></section>
    <section className="section about-perspective"><div className="shell"><p className="eyebrow"><span />The pilot perspective</p><div className="about-perspective__grid"><h2>Experience changes what you notice.</h2><div><p>Pilots learn to think ahead: weather, runway performance, alternates, timing, crew duty, and the chain of decisions behind a smooth departure. EXJET brings that same forward-looking discipline to every charter conversation.</p><p>It means asking better questions early, explaining tradeoffs clearly, and treating the operator relationship with the professional respect the mission deserves.</p></div></div><div className="about-archive-callout"><span>The founders&apos; archive</span><strong>Every pilot starts with an airplane, a logbook, and the decision to keep learning.</strong><p>We are preserving the early aircraft and flying stories that shaped EXJET, because where we began still informs how we work today.</p></div></div></section>
    <section className="section section--dark about-values"><div className="shell"><SectionIntro inverse eyebrow="Core values" title="The standard behind every conversation." /><div className="about-value-grid">{values.map(([number, title, copy]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}</div></div></section>
    <section className="section about-model"><div className="shell split-copy"><p className="eyebrow"><span />How we work</p><h2>EXJET advises. Licensed carriers operate.</h2><div><p>EXJET arranges charter as a broker. The licensed air carrier identified for each trip operates the flight. EXJET remains the client contact across aircraft sourcing, commercial terms, and trip details.</p><p>This clear division preserves operating responsibility while giving every client one consistent point of contact.</p><ButtonLink href="/why-exjet">Why clients choose EXJET</ButtonLink></div></div></section>
    <section className="about-location"><div className="shell about-location__grid"><div><p className="eyebrow eyebrow--light"><span />Dallas headquarters</p><h2>{siteConfig.address.streetAddress}<br />{siteConfig.address.addressLocality}, {siteConfig.address.addressRegion} {siteConfig.address.postalCode}</h2><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.display)}`} target="_blank" rel="noreferrer">Open in Maps <span>→</span></a></div><div><p>Follow EXJET</p><h3>Flights, aircraft, and the work behind the mission.</h3><SocialLinks light /></div></div></section>
  </>;
}
