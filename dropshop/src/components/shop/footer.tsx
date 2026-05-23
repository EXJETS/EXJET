"use client";
import Link from "next/link";
import { Zap, Shield, Truck, RotateCcw, CreditCard } from "lucide-react";

const trustItems = [
  { icon: Truck, label: "Free Shipping", sub: "On orders over $50" },
  { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free refunds" },
  { icon: Shield, label: "Secure Payments", sub: "SSL encrypted checkout" },
  { icon: CreditCard, label: "Buy Now Pay Later", sub: "Pay in 4 installments" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Trust badges */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-indigo-400" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-white text-lg">
                Drop<span className="text-indigo-400">Shop</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Your one-stop shop for the most popular products online. Curated, quality-checked, and shipped worldwide.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "All Products", href: "/shop/products" },
                { label: "Best Sellers", href: "/shop/products?filter=best-seller" },
                { label: "New Arrivals", href: "/shop/products?filter=new" },
                { label: "Sale", href: "/shop/products?filter=sale" },
                { label: "Electronics", href: "/shop/category/electronics" },
                { label: "Beauty", href: "/shop/category/beauty" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-3 text-sm">
              {[
                "Track Your Order",
                "Shipping Policy",
                "Returns & Refunds",
                "FAQ",
                "Contact Us",
                "Size Guide",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Get 10% Off</h4>
            <p className="text-sm text-gray-500 mb-4">
              Subscribe to our newsletter and get exclusive deals straight to your inbox.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Subscribe & Save 10%
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© 2025 DropShop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
