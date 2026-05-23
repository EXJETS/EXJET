"use client";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "./cart-drawer";
import { searchProducts } from "@/data/shop-products";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "All Products", href: "/shop/products" },
  { label: "Electronics", href: "/shop/category/electronics" },
  { label: "Beauty", href: "/shop/category/beauty" },
  { label: "Home & Kitchen", href: "/shop/category/home" },
  { label: "Fitness", href: "/shop/category/fitness" },
  { label: "Fashion", href: "/shop/category/fashion" },
];

export function ShopNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { setOpen, itemCount } = useCartStore();
  const count = itemCount();

  const searchResults = searchQuery.length >= 2 ? searchProducts(searchQuery).slice(0, 5) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {/* Top announcement bar */}
        <div className="bg-indigo-600 text-white text-center py-2 text-xs font-medium tracking-wide">
          🚀 Free shipping on orders over $50 · Ships worldwide in 3–14 days
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/shop" className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                Drop<span className="text-indigo-600">Shop</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen((o) => !o)}
                  className="h-9 w-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <Search className="h-4.5 w-4.5 text-gray-600" />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <form onSubmit={handleSearch} className="flex items-center border-b border-gray-100">
                      <Search className="ml-4 h-4 w-4 text-gray-400 shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-3 text-sm outline-none text-gray-900 placeholder:text-gray-400"
                      />
                    </form>
                    {searchResults.length > 0 && (
                      <ul className="py-2 max-h-64 overflow-y-auto">
                        {searchResults.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/shop/products/${p.slug}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                <p className="text-xs text-indigo-600 font-semibold">${p.price.toFixed(2)}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p className="px-4 py-4 text-sm text-gray-500 text-center">No products found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setOpen(true)}
                className="relative h-9 w-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-4.5 w-4.5 text-gray-600" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 min-w-[18px] rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden h-9 w-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
