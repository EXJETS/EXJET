import type { Metadata, Viewport } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { MeProvider } from "@/hooks/me";
import { AppFrame } from "@/components/Shell";

const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-ubuntu", display: "swap" });
const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-ubuntu-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "EXJET", template: "%s · EXJET" },
  description: "EXJET member platform. Request private jet charter quotes from verified operators.",
  icons: { icon: "/brand/exjet-mark.svg" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ubuntu.variable} ${ubuntuMono.variable}`}>
      <body>
        <MeProvider>
          <AppFrame>{children}</AppFrame>
        </MeProvider>
      </body>
    </html>
  );
}
