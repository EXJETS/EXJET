import type { Metadata } from "next";
import { absoluteUrl, isPublicProduction } from "@/data/site";

type SeoEntry = {
  title: string;
  description: string;
  image?: string;
};

export const pageSeo = {
  "/": {
    title: "Private Jet Charter Broker | EXJET",
    description: "Request private jet charter, group air charter, cargo capacity, membership access, and aircraft sales support through EXJET.",
  },
  "/charter": {
    title: "Private Jet Charter Services | EXJET",
    description: "Arrange private jet charter through a single EXJET advisor for domestic and international missions.",
  },
  "/empty-legs": {
    title: "Empty Leg Private Jet Flights | EXJET",
    description: "Search time-sensitive empty leg flight opportunities and request an EXJET match for a flexible private charter itinerary.",
  },
  "/group-charter": {
    title: "Group Air Charter Services | EXJET",
    description: "Coordinate aircraft, schedule, passenger movement, and ground details for group air charter with EXJET.",
  },
  "/cargo": {
    title: "Air Cargo Charter Services | EXJET",
    description: "Request dedicated cargo aircraft capacity for urgent, oversized, specialized, or high-value shipments through EXJET.",
  },
  "/aircraft": {
    title: "Private Jet Aircraft Categories | EXJET",
    description: "Compare representative light, midsize, super-midsize, heavy, and ultra-long-range private jet categories available through EXJET.",
  },
  "/membership": {
    title: "Private Jet Membership Programs | EXJET",
    description: "Review EXJET membership options for clients who value a consistent charter process and direct flight support.",
  },
  "/sales": {
    title: "Private Aircraft Sales and Acquisitions | EXJET",
    description: "View aircraft represented by EXJET and begin a confidential aircraft sale, acquisition, or market search.",
  },
  "/why-exjet": {
    title: "Why Choose EXJET for Private Charter | EXJET",
    description: "See how EXJET combines pilot-informed guidance, direct communication, operator review, and accountable trip coordination.",
  },
  "/about": {
    title: "About EXJET | Charter Brokerage Founded by Pilots",
    description: "Learn about EXJET, a private aviation brokerage founded by two pilots and built around informed sourcing and direct client service.",
  },
  "/faq": {
    title: "Private Jet Charter FAQ | EXJET",
    description: "Answers about private charter requests, pricing, operators, aircraft, empty legs, membership, group travel, cargo, and sales.",
  },
  "/contact": {
    title: "Request a Private Jet Charter Quote | EXJET",
    description: "Send a private, group, or cargo charter request to EXJET or contact the charter desk for urgent travel.",
  },
  "/privacy": {
    title: "Privacy Policy | EXJET",
    description: "Read how EXJET collects, uses, stores, and protects information submitted through its website and services.",
  },
  "/terms": {
    title: "Website Terms | EXJET",
    description: "Review the terms governing access to the EXJET website and requests submitted through its digital forms.",
  },
  "/account": {
    title: "Client Access Preview | EXJET",
    description: "Access the private EXJET client portal preview for returning charter customers.",
  },
} satisfies Record<string, SeoEntry>;

export type StaticSeoPath = keyof typeof pageSeo;

export function buildMetadata(path: StaticSeoPath, options?: { noindex?: boolean }): Metadata {
  const entry: SeoEntry = pageSeo[path];
  const image = entry.image || "/images/manufacturers/latitude-header-new.jpg";
  const index = isPublicProduction && !options?.noindex;
  return {
    title: { absolute: entry.title },
    description: entry.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: "EXJET",
      title: entry.title,
      description: entry.description,
      images: [{ url: image, alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [image],
    },
    robots: {
      index,
      follow: index,
      googleBot: index
        ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
        : { index: false, follow: false },
    },
  };
}

export function buildDynamicMetadata({
  path,
  title,
  description,
  image,
  noindex = false,
}: {
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const index = isPublicProduction && !noindex;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: "EXJET", title, description, images: image ? [{ url: image, alt: title }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : [] },
    robots: { index, follow: index },
    metadataBase: new URL(absoluteUrl("/")),
  };
}
