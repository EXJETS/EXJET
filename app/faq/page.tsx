import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import { SupportHeader } from "@/components/PublicSupport";
import styles from "@/components/PublicSupport.module.css";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/data/seo";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata = buildMetadata("/faq");

export default function FaqPage() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  const groups=[...new Set(faqs.map(faq=>faq.category))];
  return <div className={styles.frame}>
    <StructuredData data={faqSchema} />
    <SupportHeader label="EXJET support" title="Private charter FAQ" copy="Find answers about quotes, aircraft, empty legs and operator review before you book." />
    <div className={`${styles.wrap} ${styles.workspace}`}>
      <div className={styles.main}>{groups.map((group,index)=><section id={`faq-${index}`} className={styles.card} key={group}>
        <h2>{group}</h2>{faqs.filter(faq=>faq.category===group).map(faq=><details className={styles.faqItem} key={faq.question}><summary><strong>{faq.question}</strong><CaretDownIcon size={18} aria-hidden="true"/></summary><p>{faq.answer}</p></details>)}
      </section>)}</div>
      <aside className={styles.rail}><section className={styles.card}><p className={styles.eyebrow}>Jump to</p><h2>Topics</h2><nav className={styles.anchorList} aria-label="FAQ topics">{groups.map((group,index)=><a key={group} href={`#faq-${index}`}>{group}</a>)}</nav></section><section className={styles.card}><h2>Ask about your trip</h2><p>An EXJET advisor can answer questions about your route, aircraft and timing.</p><Link className={styles.primary} href="/contact/">Contact EXJET</Link></section></aside>
    </div>
  </div>;
}
