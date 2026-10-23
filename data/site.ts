export const aviationSolutions = [
  { name: "Empty legs", path: "/empty-legs", description: "One-way opportunities for flexible travel plans.", icon: "empty" },
  { name: "Charters", path: "/private-jet-charter", description: "Private and group flights arranged around your schedule.", icon: "charter" },
  { name: "Dry lease", path: "/dry-lease", description: "Aircraft leasing options for your operating needs.", icon: "lease" },
  { name: "Fractional", path: "/fractional", description: "Shared aircraft ownership shaped around how you fly.", icon: "fractional" },
  { name: "Ownership", path: "/ownership", description: "Aircraft acquisition, sales and owner support.", icon: "ownership" },
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
    "EXJET provides empty-leg opportunities, private and group charters, dry lease consulting, fractional ownership advice and aircraft ownership support.",
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
