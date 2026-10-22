export type ContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  links?: { label: string; path: string }[];
  table?: { caption: string; headers: string[]; rows: string[][] };
};

export type ContentPage = {
  path: string;
  title: string;
  seoTitle?: string;
  description: string;
  kicker: string;
  kind: "hub" | "article" | "airport" | "route" | "service" | "legal" | "city" | "destination" | "comparison" | "glossary";
  sections: ContentSection[];
  parent?: { name: string; path: string };
  sources?: { label: string; url: string }[];
  image?: { src: string; alt: string; width: number; height: number; caption?: string; scene?: "exterior" | "interior" };
  items?: string[];
  collectionTitle?: string;
  serviceCatalog?: boolean;
  journalDirectory?: boolean;
  journal?: { category: string; region: string };
  consultation?: { label: string; subject: string };
  related?: string[];
  facts?: { label: string; value: string }[];
  codes?: string[];
  readTime?: string;
  updated?: string;
  published?: string;
  draft?: boolean;
  noindex?: boolean;
  faqs?: { question: string; answer: string }[];
};
