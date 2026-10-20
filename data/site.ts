export const aviationSolutions = [
  { name: "Charter", path: "/private-jet-charter", description: "Private jet charter planned around your route, schedule and cabin requirements.", icon: "charter" },
  { name: "Group Charter", path: "/group-charter", description: "Coordinated air travel for corporate teams, sports, events and larger passenger groups.", icon: "group" },
  { name: "Sales & Acquisitions", path: "/sales", description: "Aircraft search, market analysis and transaction consulting for buyers and sellers.", icon: "sales" },
  { name: "Aircraft Management", path: "/aircraft-management", description: "Owner consulting across operating plans, budgets, provider selection and reporting.", icon: "management" },
  { name: "MRO", path: "/mro", description: "Maintenance, repair and overhaul consulting, provider sourcing and downtime coordination.", icon: "mro" },
  { name: "Interior Completions", path: "/interior-completions", description: "Cabin refurbishment and completion consulting, from the design brief to delivery planning.", icon: "interior" },
  { name: "Starlink Installation", path: "/starlink-installation", description: "Aircraft connectivity consulting, eligibility review and installation coordination.", icon: "connectivity" },
] as const;

const PRODUCTION_ORIGIN = "https://www.exjet.com";

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
    "EXJET is a Dallas-based business aviation solutions company providing charter, group charter, aircraft sales and acquisitions, aircraft management consulting, MRO consulting, interior completions and Starlink installation coordination.",
  phone: {
    primary: {
      display: "+1 407 747 5288",
      e164: "+14077475288",
      href: "tel:+14077475288",
    },
  },
  email: {
    general: "sales@exjet.com",
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

export const socialProfiles = Object.values(siteConfig.social);

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
    url: siteConfig.url,
    logo: absoluteUrl("/brand/exjet-wordmark.svg"),
    description: siteConfig.description,
    email: siteConfig.email.general,
    telephone: siteConfig.phone.primary.e164,
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
        telephone: siteConfig.phone.primary.e164,
        availableLanguage: "en",
      },
      {
        "@type": "ContactPoint",
        contactType: "cargo charter",
        email: siteConfig.email.cargo,
        telephone: siteConfig.phone.primary.e164,
        availableLanguage: "en",
      },
      {
        "@type": "ContactPoint",
        contactType: "aircraft sales",
        email: siteConfig.email.general,
        telephone: siteConfig.phone.primary.e164,
        availableLanguage: "en",
      },
    ],
    sameAs: socialProfiles,
    hasOfferCatalog: { "@type": "OfferCatalog", name: "EXJET business aviation solutions", itemListElement: aviationSolutions.map(service => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: service.name, description: service.description, url: absoluteUrl(service.path) } })) },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteOrigin}/#dallas-office`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: absoluteUrl("/images/manufacturers/latitude-header-new.jpg"),
    logo: absoluteUrl("/brand/exjet-wordmark.svg"),
    description: siteConfig.description,
    telephone: siteConfig.phone.primary.e164,
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
