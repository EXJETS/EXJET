import type { Metadata } from "next";
import { absoluteUrl, isPublicProduction } from "@/data/site";

type SeoEntry = {
  title: string;
  description: string;
  image?: string;
};

export const pageSeo = {
  "/": {
    title: "Private Jet Charter & Business Aviation | EXJET Dallas",
    description: "Arrange business jet charter worldwide with Dallas-based EXJET. Compare aircraft, routes and complete trip proposals with one dedicated point of contact.",
  },
  "/charter": {
    title: "Request a Private Jet Charter Quote | Flight Search | EXJET",
    description: "Send your airports, travel dates and passenger count to EXJET. Request aircraft options and a complete charter quote for your domestic or international trip.",
  },
  "/empty-legs": {
    title: "Empty Leg Private Jet Flights | EXJET",
    description: "Explore empty leg flight opportunities with EXJET. Share your route and flexible dates to request current availability, aircraft details and a written quote.",
  },
  "/group-charter": {
    title: "Group Air Charter Services | EXJET",
    description: "Arrange group air charter for corporate teams, sports and events. Coordinate passenger counts, baggage, schedules and airport transfers with an EXJET advisor.",
  },
  "/cargo": {
    title: "Air Cargo Charter Services | EXJET",
    description: "Request cargo aircraft charter for urgent, oversized or high-value shipments. Share weight, dimensions, route and timing for a tailored proposal from EXJET.",
  },
  "/aircraft": {
    title: "Business Jet Charter Aircraft & Cabin Guide | EXJET",
    description: "Compare Citation, Challenger, Gulfstream, Global and Falcon aircraft. Review cabins, mission planning and charter costs, then request options for your journey.",
  },
  "/membership": {
    title: "Private Jet Membership Programs | EXJET",
    description: "Review EXJET membership information and discuss your travel pattern with an advisor. Confirm program terms, aircraft access and pricing before any commitment.",
  },
  "/sales": {
    title: "Private Aircraft Sales and Acquisitions | EXJET",
    description: "Discuss aircraft sales and acquisitions with EXJET. Define your mission, review representation options and request a confidential aircraft search or sale brief.",
  },
  "/why-exjet": {
    title: "Why Choose EXJET for Private Charter | EXJET",
    description: "Learn how EXJET coordinates aircraft selection, operator review and charter planning. Understand the broker relationship and the questions to ask before booking.",
  },
  "/about": {
    title: "About EXJET | Charter Brokerage Founded by Pilots",
    description: "Meet EXJET, a Dallas-based business aviation brokerage founded by pilots. Learn about our approach to aircraft sourcing, charter coordination and client service.",
  },
  "/faq": {
    title: "Private Jet Charter FAQ | EXJET",
    description: "Find answers about charter pricing, aircraft selection, empty legs, passenger details and operator checks. Learn what to confirm before booking with EXJET.",
  },
  "/contact": {
    title: "Request a Private Jet Charter Quote | EXJET",
    description: "Contact EXJET in Dallas for business jet, group or cargo charter. Send your itinerary and requirements, or speak with the charter desk about time-sensitive travel.",
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
    title: "Client Support | EXJET",
    description: "Contact your EXJET advisor for itineraries, documents and new flight requests. Online account sign-in is not available yet.",
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
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
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
      follow: isPublicProduction,
      googleBot: index
        ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
        : { index: false, follow: isPublicProduction },
    },
  };
}

export function buildDynamicMetadata({
  path,
  title,
  description,
  image,
  noindex = false,
  type = "website",
}: {
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const index = isPublicProduction && !noindex;
  const socialImage = image || "/images/home/owner-selected-hero.webp";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type, url: absoluteUrl(path), siteName: "EXJET", title, description, images: [{ url: socialImage, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
    robots: { index, follow: isPublicProduction, googleBot: { index, follow: isPublicProduction, ...(index ? { "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 } : {}) } },
    metadataBase: new URL(absoluteUrl("/")),
  };
}
