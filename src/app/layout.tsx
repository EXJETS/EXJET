import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Cormorant_Garamond } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://exjet.com"),
  title: {
    default: "EXJET.com — Global Access, On-Demand.",
    template: "%s · EXJET.com",
  },
  description:
    "Global Access, On-Demand. Reserve a private jet in minutes across 5,000+ airports worldwide — curated fleet, ARGUS Platinum safety, 24/7 concierge. Empty legs, popular routes, and live sports-calendar flights.",
  applicationName: "EXJET",
  keywords: [
    "private jet",
    "private jet charter",
    "jet charter",
    "private aviation",
    "empty legs",
    "empty leg flights",
    "on demand private jet",
    "F1 grand prix jet",
    "super bowl private jet",
    "masters private jet",
    "world cup private jet",
    "teterboro to los angeles",
    "van nuys jet",
    "EXJET",
    "exjet.com",
  ],
  category: "travel",
  authors: [{ name: "EXJET" }],
  creator: "EXJET",
  publisher: "EXJET",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen bg-ivory text-ink antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
