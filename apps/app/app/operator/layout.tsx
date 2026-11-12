import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passenger manifest",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  referrer: "no-referrer",
};

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
