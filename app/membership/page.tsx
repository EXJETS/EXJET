import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { membershipTiers } from "@/data/membership";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";

export const metadata = buildMetadata("/membership", { noindex: true });

export default function MembershipPage() {
  return <>
    <PageHero dark eyebrow="EXJET membership" title={<>More continuity.<br /><em>Less friction.</em></>} copy="Annual flight-hour programs for clients who value defined access, familiar service, and one team that already understands how they travel.">
      <ButtonLink href={`mailto:${siteConfig.email.charter}?subject=EXJET%20membership%20consultation`} variant="light">Talk with membership</ButtonLink>
    </PageHero>
    <section className="section membership-section">
      <div className="shell"><p className="ex-draft-note">Program preview. Membership pricing and benefits require confirmation before any enrollment or payment.</p>
        <SectionIntro eyebrow="Four levels of access" title="Choose the annual program that matches your flying pattern." copy="Each tier pairs pre-purchased flight hours with a defined service level. Program eligibility, aircraft access, hourly rates, rollover, and booking guarantees are governed by the signed membership agreement." />
        <div className="membership-grid">
          {membershipTiers.map((tier, index) => <article className={`membership-card${tier.featured ? " is-featured" : ""}`} id={tier.slug} key={tier.slug}>
            <div className="membership-card__head"><span>0{index + 1}</span><p>{tier.label}</p></div>
            <h2>{tier.name}</h2>
            <p className="membership-card__price">{tier.price}<small>/ year</small></p>
            <strong>{tier.hours} included</strong>
            <ul>{tier.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
            <a href={`mailto:${siteConfig.email.charter}?subject=${encodeURIComponent(`${tier.name} membership inquiry`)}`}>{tier.invitationOnly ? "Request an invitation" : `Select ${tier.name}`}<span aria-hidden="true">→</span></a>
          </article>)}
        </div>
        <p className="membership-note">All tiers include 24/7 concierge support, access to vetted operators, and no peak-day restrictions under the applicable program terms. Membership is subject to availability, eligibility, and a signed agreement.</p>
      </div>
    </section>
    <section className="section section--dark membership-value">
      <div className="shell split-copy split-copy--inverse"><p className="eyebrow eyebrow--light"><span />Designed around repeat travel</p><h2>A program that remembers the mission.</h2><div><p>Your aircraft preferences, traveler details, catering notes, ground arrangements, and billing profile can carry forward from one request to the next.</p><p>That continuity is the real value: less re-entry, faster decisions, and a service team that begins with context.</p><ButtonLink href="/contact" variant="light">Build your program</ButtonLink></div></div>
    </section>
  </>;
}
