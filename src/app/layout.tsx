import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "@/components/shell/header";
import { TabBar } from "@/components/shell/tab-bar";
import { Footer } from "@/components/shell/footer";
import { StoreBoot } from "@/store/app-store";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://exjet.com"),
  title: { default: "EXJET — Private jet charter & empty legs", template: "%s · EXJET" },
  description:
    "Charter a private jet in minutes or fly an empty leg for a fraction of the price. Instant quotes, vetted operators, 24/7 concierge.",
  applicationName: "EXJET",
  appleWebApp: { capable: true, title: "EXJET", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.png", sizes: "32x32" }],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // draw under the notch; insets handled with env(safe-area-inset-*)
  themeColor: "#f7f5f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">
        <StoreBoot />
        <Header />
        <main className="min-h-[70dvh]">{children}</main>
        <Footer />
        <TabBar />
      </body>
    </html>
  );
}
