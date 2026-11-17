import Link from "next/link";
import type { ContentSection } from "@/data/content-types";
import { StructuredData } from "@/components/StructuredData";

export function ContentSections({ sections }: { sections: ContentSection[] }) {
  return sections.map((section, index) => (
    <section key={section.heading} aria-labelledby={`section-${index + 1}`}>
      <h2 id={`section-${index + 1}`}>{section.heading}</h2>
      {section.paragraphs.map((text, i) => <p key={i}>{text}</p>)}
      {section.table ? (
        <div className="ex-table-scroll" tabIndex={0} role="region" aria-label={section.table.caption}>
          <table className="ex-data-table">
            <caption>{section.table.caption}</caption>
            <thead><tr>{section.table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>{section.table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0
                ? <th key={cellIndex} scope="row">{cell}</th>
                : <td key={cellIndex}>{cell}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      ) : null}
      {section.bullets?.length ? <ul>{section.bullets.map(text => <li key={text}>{text}</li>)}</ul> : null}
      {section.links?.map(link => <p key={link.path}><Link href={link.path}>{link.label}</Link></p>)}
    </section>
  ));
}

export function ContentFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  return (
    <section className="ex-content-faq">
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
          "@type": "Question", name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }} />
      <h2>Frequently asked questions</h2>
      {faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
    </section>
  );
}
