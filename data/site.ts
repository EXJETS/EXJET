const PRODUCTION_ORIGIN = "https://exjet.com";

function normalizeOrigin(value: string) {
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).origin;
  } catch {
    return "http://localhost:3000";
  }
}

const deploymentOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const siteOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || deploymentOrigin);
export const isPublicProduction = siteOrigin === PRODUCTION_ORIGIN;

export const siteConfig = {
  name: "EXJET",
  legalName: "EXJET LLC",
  url: siteOrigin,
  productionUrl: PRODUCTION_ORIGIN,
  description:
    "Private aviation brokerage arranging passenger charter, group charter, cargo charter, membership programs, and aircraft sales and acquisitions.",
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
  return new URL(path, `${siteOrigin}/`).toString();
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/exjet-mark.svg"),
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
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    image: absoluteUrl("/images/manufacturers/latitude-header-new.jpg"),
    logo: absoluteUrl("/brand/exjet-mark.svg"),
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
