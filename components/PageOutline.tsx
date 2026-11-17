import type { ContentSection } from "@/data/content-types";

/** Server-rendered wayfinding, with a compact native disclosure on mobile. */
export function PageOutline({ sections }: { sections: ContentSection[] }) {
  if (sections.length < 3) return null;
  const links = sections.map((section, index) => (
    <li key={section.heading}><a href={`#section-${index + 1}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.heading}</a></li>
  ));
  return <>
    <aside className="ex-outline"><nav aria-label="Page sections"><p>On this page</p><ol>{links}</ol></nav></aside>
    <details className="ex-outline-mobile"><summary>On this page</summary><nav aria-label="Page sections"><ol>{links}</ol></nav></details>
  </>;
}
