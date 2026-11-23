export const aviationSolutions = [
  { name: "Passenger charter", path: "/private-jet-charter", description: "On demand private jet charter for business and personal travel.", icon: "charter", scope: "" },
  { name: "Group charter", path: "/group-charter", description: "Private aircraft for larger groups, events and team travel.", icon: "charter", scope: "" },
  { name: "Cargo charter", path: "/cargo", description: "Aircraft capacity for time sensitive charter shipments.", icon: "charter", scope: "" },
  { name: "Empty legs", path: "/empty-legs", description: "Repositioning flight opportunities for flexible trips.", icon: "empty", scope: "" },
] as const;

const PRODUCTION_ORIGIN = "https://www.exjet.com";
const PUBLIC_CONTACT_EMAIL = "info@exjet.com";

function normalizeOrigin(value: string) {
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).origin;
  } catch {
    return "http://localhost:3000";
  }
}

// Canonicals, social assets, structured data and sitemap URLs must share the
// public host, never the per-deployment VERCEL_URL.
export const siteOrigin = PRODUCTION_ORIGIN;

// NODE_ENV is also "production" during preview builds. Use Vercel's deployment
// environment so a preview cannot become indexable by inheriting the site URL.
// Non-Vercel production builds require an explicit public-site opt-in.
export const isPublicProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production" &&
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || "") === PRODUCTION_ORIGIN;

export const siteConfig = {
  name: "EXJET",
  legalName: "EXJET LLC",
  url: siteOrigin,
  productionUrl: PRODUCTION_ORIGIN,
  description:
    "EXJET is a Dallas based air charter broker arranging private passenger flights, group travel, cargo and empty legs through licensed air carriers.",
  email: {
    general: PUBLIC_CONTACT_EMAIL,
    charter: "charter@exjet.com",
    cargo: "cargo@exjet.com",
  },
  address: {
    streetAddress: "1910 Pacific Ave",
    addressLocality: "Dallas",
    addressRegion: "TX",
    postalCode: "75201",
    addressCountry: "US",
    display: "1910 Pacific Ave, Dallas, TX 75201",
  },
  social: {
    instagram: "https://www.instagram.com/exjets/",
    facebook: "https://www.facebook.com/people/EXJET/61562953075531/",
    linkedin: "https://www.linkedin.com/company/exjet/",
    yelp: "https://www.yelp.com/biz/exjet-dallas",
  },
  responseWindow: "shortly",
} as const;

// Use owned brand profiles as identity references. Third-party listings may
// show stale contact details and are not authoritative brand identifiers.
export const socialProfiles = [
  siteConfig.social.instagram,
  siteConfig.social.facebook,
  siteConfig.social.linkedin,
];

export function absoluteUrl(path = "/") {
  const url = new URL(path, `${siteOrigin}/`);
  if (!url.pathname.endsWith("/") && !url.pathname.split("/").at(-1)?.includes(".")) {
    url.pathname += "/";
  }
  return url.toString();
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteOrigin}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/exjet-wordmark.svg"),
    description: siteConfig.description,
    email: siteConfig.email.general,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "charter reservations",
        email: siteConfig.email.charter,
        availableLanguage: "en",
      },
      {
        "@type": "ContactPoint",
        contactType: "cargo charter",
        email: siteConfig.email.cargo,
        availableLanguage: "en",
      },
      {
        "@type": "ContactPoint",
        contactType: "aircraft sales",
        email: siteConfig.email.general,
        availableLanguage: "en",
      },
    ],
    sameAs: socialProfiles,
    hasOfferCatalog: { "@type": "OfferCatalog", name: "EXJET air charter", itemListElement: aviationSolutions.map(service => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: service.name, description: service.description, url: absoluteUrl(service.path) } })) },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteOrigin}/#dallas-office`,
    name: siteConfig.name,
    parentOrganization: { "@id": `${siteOrigin}/#organization` },
    url: siteConfig.url,
    image: absoluteUrl("/images/manufacturers/global-8000-clouds.webp"),
    logo: absoluteUrl("/brand/exjet-wordmark.svg"),
    description: siteConfig.description,
    email: siteConfig.email.general,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    sameAs: socialProfiles,
  };
}
