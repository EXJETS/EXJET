import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://exjet.com"),
  title: {
    default: "EXJET.com — Global Access, On-Demand.",
    template: "%s · EXJET.com",
  },
  description:
    "Global Access, On-Demand. Reserve a private jet in minutes across 50+ destinations worldwide — curated fleet, ARGUS Platinum safety, 24/7 concierge.",
  applicationName: "EXJET",
  keywords: [
    "private jet",
    "jet charter",
    "private aviation",
    "on demand",
    "EXJET",
    "exjet.com",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://exjet.com",
    siteName: "EXJET",
    title: "EXJET.com — Global Access, On-Demand.",
    description:
      "Reserve a private jet in minutes. A curated worldwide fleet, available 24/7.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EXJET.com — Global Access, On-Demand.",
    description:
      "Reserve a private jet in minutes. A curated worldwide fleet, available 24/7.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-black text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
