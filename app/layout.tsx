import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFrame } from "@/components/SiteFrame";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd, organizationJsonLd, siteOrigin } from "@/data/site";
import "./globals.css";
import "./apple-system.css";
import "./brand-pages.css";
import "./editorial.css";
import "./apple-responsive.css";
import "./interaction.css";
import "./design-system.css";
import "./aviation-editorial.css";
import "./public-campaign.css";
import "./inquiry-form.css";

const display = localFont({
  src: "../fonts/libre-caslon-display.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-exjet-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
});

const ubuntu = localFont({
  src: [
    { path: "../node_modules/@fontsource/ubuntu/files/ubuntu-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../node_modules/@fontsource/ubuntu/files/ubuntu-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/ubuntu/files/ubuntu-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-ubuntu",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  ...buildMetadata("/"),
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "EXJET", url: siteOrigin, publisher: { "@id": siteOrigin + "/#organization" } };
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${ubuntu.variable}${process.env.NODE_ENV === "development" ? " ex-design-preview" : ""}`}>
      <body className={ubuntu.className}>
        <a className="ex-skip-link" href="#main-content">Skip to content</a>
        <StructuredData data={organizationJsonLd()} />
        <StructuredData data={localBusinessJsonLd()} />
        <StructuredData data={websiteSchema} />
        <SiteFrame header={<SiteHeader />} footer={<SiteFooter />}>{children}</SiteFrame>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
