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
    default: "EXJET — Private Jet Charter, Jet Card & Aircraft Sales",
    template: "%s · EXJET",
  },
  description:
    "Book a private jet charter in minutes. EXJET offers fixed hourly rates from $6,500/hr, no blackout dates, ARGUS-certified operators, and 24/7 concierge across 5,000+ airports worldwide. Jet cards, empty legs, and aircraft sales.",
  applicationName: "EXJET",
  keywords: [
    "private jet charter",
    "private jet rental",
    "book a private jet",
    "charter a private jet",
    "private jet cost",
    "how much does a private jet cost",
    "private jet pricing",
    "private jet booking",
    "jet card",
    "private jet card",
    "jet card program",
    "private jet membership",
    "empty leg flights",
    "empty leg deals",
    "private aviation",
    "on demand private jet",
    "luxury air charter",
    "business jet charter",
    "aircraft charter",
    "light jet charter",
    "midsize jet charter",
    "super midsize jet charter",
    "heavy jet charter",
    "ultra long range jet",
    "Gulfstream charter",
    "Challenger charter",
    "Phenom 300 charter",
    "Citation charter",
    "private jet New York",
    "private jet Miami",
    "private jet Los Angeles",
    "private jet Teterboro",
    "private jet London",
    "private jet Dubai",
    "private jet Las Vegas",
    "private jet Aspen",
    "aircraft sales",
    "private jet for sale",
    "used jet for sale",
    "aircraft brokerage",
    "jet broker",
    "aircraft acquisition",
    "dry lease aircraft",
    "ARGUS platinum",
    "ARGUS certified",
    "FAR Part 135",
    "Wyvern wingman",
    "no blackout dates",
    "fixed hourly rate",
    "no hidden fees",
    "refundable jet card",
    "private jet concierge",
    "on demand aviation",
    "fractional jet ownership alternative",
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
    title: "EXJET — Private Jet Charter, Jet Card & Aircraft Sales",
    description:
      "Book a private jet from $6,500/hr. No blackout dates, ARGUS-certified operators, 24/7 concierge. Jet cards, empty legs, and aircraft sales worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EXJET — Private Jet Charter, Jet Card & Aircraft Sales",
    description:
      "Book a private jet from $6,500/hr. No blackout dates, ARGUS-certified operators, 24/7 concierge. 5,000+ airports worldwide.",
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
