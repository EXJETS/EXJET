import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/data/seo";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata = buildMetadata("/faq");

export default function FaqPage() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <PageHero eyebrow="Frequently asked questions" title={<>Clarity before<br /><em>you commit.</em></>} copy="Straight answers about how EXJET sources, evaluates, and coordinates private aircraft charter and aircraft transactions." />
    <section className="section faq-section"><div className="shell"><SectionIntro eyebrow="The essentials" title="What clients ask before the first flight." /><div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary><strong>{faq.question}</strong><CaretDownIcon aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></div></section>
    <section className="section section--dark faq-cta"><div className="shell split-copy split-copy--inverse"><p className="eyebrow eyebrow--light"><span />Ask us directly</p><h2>Your mission may need a more specific answer.</h2><div><p>An EXJET advisor is available around the clock for route, aircraft, timing, and transaction questions.</p><ButtonLink href="/contact" variant="light">Speak with an advisor</ButtonLink></div></div></section>
  </>;
}
