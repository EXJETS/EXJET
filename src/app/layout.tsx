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
  metadataBase: new URL("https://luminary.aero"),
  title: {
    default: "Luminary Air Group — Aircraft Interior Design, Manufacturing & Installation",
    template: "%s · Luminary Air Group",
  },
  description:
    "Experienced. Reliable. Flexible. Luminary Air Group specializes in aircraft interior design, manufacturing, and installation — including cabin comfort systems, special mission interiors (ADMI), and VIP completions. Part 21 manufacturer.",
  applicationName: "Luminary Air Group",
  keywords: [
    "aircraft interior",
    "aircraft insulation",
    "cabin noise reduction",
    "cabin comfort systems",
    "special mission interior",
    "ADMI",
    "All Day Mission Interior",
    "VIP interior",
    "aircraft completion",
    "aircraft cabinetry",
    "cabin acoustic",
    "BBJ interior",
    "King Air interior",
    "Luminary Air Group",
    "Part 21 manufacturer",
  ],
  category: "aviation",
  authors: [{ name: "Luminary Air Group" }],
  creator: "Luminary Air Group",
  publisher: "Luminary Air Group",
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
    url: "https://luminary.aero",
    siteName: "Luminary Air Group",
    title: "Luminary Air Group — Aircraft Interior Design, Manufacturing & Installation",
    description:
      "Experienced. Reliable. Flexible. Aircraft interiors — from cabin insulation to special mission platforms.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luminary Air Group — Aircraft Interior Design, Manufacturing & Installation",
    description:
      "Experienced. Reliable. Flexible. Aircraft interiors — from cabin insulation to special mission platforms.",
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
      <body className="min-h-screen bg-white text-[var(--color-ink)] antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
