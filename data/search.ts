import type { ContentPage } from "./content-types";

export type SearchItem = { path: string; title: string; description: string; keywords?: string };

export function contentSearchItem(page: ContentPage): SearchItem {
  const content = [
    page.kicker,
    ...(page.codes ?? []),
    ...(page.facts ?? []).flatMap(fact => [fact.label, fact.value]),
    ...page.sections.flatMap(section => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []),
      ...(section.links ?? []).map(link => link.label),
      ...(section.table ? [section.table.caption, ...section.table.headers, ...section.table.rows.flat()] : []),
    ]),
    ...(page.faqs ?? []).flatMap(faq => [faq.question, faq.answer]),
  ].join(" ");
  // Search matches words, not phrases. Send each normalized word once instead
  // of serializing entire guides into the client search component.
  const keywords = [...new Set(normalizeSearch(content).split(/\s+/).filter(Boolean))].join(" ");
  return { path: page.path, title: page.title, description: page.description, keywords };
}

export function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[-/\u2010-\u2015]/g, " ");
}

const featuredPaths = new Set(["/travel-journal", "/services", "/business-aviation-consulting", "/executive-assistants", "/family-office-private-aviation", "/aircraft-owners", "/aircraft", "/pricing"]);

export function searchItems(items: SearchItem[], query: string) {
  const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return items.filter(item => featuredPaths.has(item.path));
  return items.map(item => {
    const title = normalizeSearch(item.title);
    const text = normalizeSearch(`${item.title} ${item.description} ${item.path} ${item.keywords ?? ""}`);
    const score = words.every(word => text.includes(word))
      ? words.reduce((total, word) => total + (title.includes(word) ? 3 : 1), 0)
      : 0;
    return { item, score };
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.item);
}
