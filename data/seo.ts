import type { Metadata } from "next";
import { absoluteUrl, isPublicProduction } from "@/data/site";

type SeoEntry = {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
};

export const pageSeo = {
  "/": {
    title: "EXJET | Private Jet Charter & Business Aviation",
    description: "EXJET is a Dallas-based aviation solutions company arranging nationwide private jet charter, group travel and air cargo through licensed carriers.",
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
    title: "Group Air Charter for Corporate & Sports Teams | EXJET",
    description: "Arrange group air charter for corporate teams, sports and events. Coordinate passenger counts, baggage, schedules and airport transfers with an EXJET advisor.",
  },
  "/cargo": {
    title: "Air Cargo Charter Services | EXJET",
    description: "Request cargo aircraft charter for urgent, oversized or high-value shipments. Share weight, dimensions, route and timing for a tailored proposal from EXJET.",
  },
  "/aircraft": {
    title: "Private Jet Charter Aircraft: Cabins & Costs | EXJET",
    description: "Compare Citation, Challenger, Gulfstream, Global and Falcon aircraft. Review cabins, mission planning and charter costs, then request options for your journey.",
  },
  "/membership": {
    noindex: true,
    title: "Private Jet Membership Programs | EXJET",
    description: "Review EXJET membership information and discuss your travel pattern with an advisor. Confirm program terms, aircraft access and pricing before any commitment.",
  },
  "/sales": {
    title: "Private Jets for Sale & Aircraft Acquisitions | EXJET",
    description: "Discuss aircraft sales and acquisitions with EXJET. Define your mission, review representation options and request a confidential aircraft search or sale brief.",
  },
  "/why-exjet": {
    title: "Private Aviation Consulting & Charter Planning | EXJET",
    description: "Learn how EXJET coordinates aircraft selection, operator review and charter planning. Explore aviation consulting and the questions to ask before booking.",
  },
  "/about": {
    title: "About EXJET | Business & Commercial Aviation Solutions",
    description: "EXJET is a Dallas-based aviation solutions company serving business and commercial aviation, from charter and leasing to ownership and technical support.",
  },
  "/faq": {
    title: "Private Jet Charter FAQ | EXJET",
    description: "Find answers about charter pricing, aircraft selection, empty legs, passenger details and operator checks. Learn what to confirm before booking with EXJET.",
  },
  "/contact": {
    title: "Contact EXJET | Aviation Solutions",
    description: "Contact EXJET for business and commercial aviation solutions. Discuss passenger and cargo charter, leasing, ACMI, ownership, crew or technical requirements.",
  },
  "/privacy": {
    noindex: true,
    title: "Privacy Policy | EXJET",
    description: "Read how EXJET collects, uses, stores, and protects information submitted through its website and services.",
  },
  "/terms": {
    noindex: true,
    title: "Website Terms | EXJET",
    description: "Review the terms governing access to the EXJET website and requests submitted through its digital forms.",
  },
  "/account": {
    noindex: true,
    title: "Client Support | EXJET",
    description: "Contact your EXJET advisor for itineraries, documents and new flight requests. Online account sign-in is not available yet.",
  },
} satisfies Record<string, SeoEntry>;

export type StaticSeoPath = keyof typeof pageSeo;

export function buildMetadata(path: StaticSeoPath): Metadata {
  const entry: SeoEntry = pageSeo[path];
  const image = entry.image || "/images/manufacturers/global-8000-clouds.webp";
  const index = isPublicProduction && !entry.noindex;
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
  published,
  updated,
}: {
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  published?: string;
  updated?: string;
}): Metadata {
  const index = isPublicProduction && !noindex;
  const socialImage = image || "/images/manufacturers/global-8000-clouds.webp";
  const sharedOpenGraph = { url: absoluteUrl(path), siteName: "EXJET", title, description, images: [{ url: socialImage, alt: title }] };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: type === "article"
      ? { ...sharedOpenGraph, type, publishedTime: published, modifiedTime: updated }
      : { ...sharedOpenGraph, type },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
    metadataBase: new URL(absoluteUrl("/")),
    robots: { index, follow: isPublicProduction, googleBot: { index, follow: isPublicProduction, ...(index ? { "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 } : {}) } },
  };
}
