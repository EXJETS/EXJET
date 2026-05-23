import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/shop/navbar";
import { Footer } from "@/components/shop/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dropshop.vercel.app"),
  title: {
    default: "DropShop — Best-Selling Products Online",
    template: "%s · DropShop",
  },
  description:
    "Discover the internet's best-selling products — electronics, beauty, home, fitness, fashion, and more. Free shipping on orders over $50.",
  keywords: ["dropshipping", "online store", "electronics", "beauty products", "fitness gear", "best sellers"],
  openGraph: {
    type: "website",
    siteName: "DropShop",
    title: "DropShop — Best-Selling Products Online",
    description: "Free shipping on orders over $50. 34+ trending products across 6 categories.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased" style={{ fontFamily: "var(--font-geist-sans)" }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
