import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { organizationJsonLd, siteOrigin } from "@/data/site";
import "@fontsource/ubuntu/latin-300.css";
import "@fontsource/ubuntu/latin-400.css";
import "@fontsource/ubuntu/latin-500.css";
import "./globals.css";
import "./apple-system.css";
import "./brand-pages.css";
import "./editorial.css";
import "./apple-responsive.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  ...buildMetadata("/"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "EXJET", url: siteOrigin };
  return (
    <html lang="en" data-scroll-behavior="smooth" className={process.env.NODE_ENV === "development" ? "ex-design-preview" : undefined}>
      <body>
        <a className="ex-skip-link" href="#main-content">Skip to content</a>
        <StructuredData data={organizationJsonLd()} />
        <StructuredData data={websiteSchema} />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
