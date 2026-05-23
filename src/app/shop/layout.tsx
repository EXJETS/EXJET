import type { Metadata } from "next";
import { ShopNavbar } from "@/components/shop/shop-navbar";
import { ShopFooter } from "@/components/shop/shop-footer";

export const metadata: Metadata = {
  title: {
    default: "DropShop — Best Products, Best Prices",
    template: "%s · DropShop",
  },
  description:
    "Discover the most popular products online — electronics, beauty, home, fitness, and more. Free shipping on orders over $50.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <ShopNavbar />
      <main>{children}</main>
      <ShopFooter />
    </div>
  );
}
