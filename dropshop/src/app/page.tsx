import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, TrendingUp, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { categories, getFeaturedProducts, getNewArrivals, products } from "@/data/products";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-medium mb-6">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending products updated weekly
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                The Internet&apos;s
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  Best-Selling
                </span>
                <br />
                Products
              </h1>
              <p className="mt-6 text-lg text-indigo-200 leading-relaxed max-w-lg">
                Curated from top global suppliers. Electronics, beauty, home essentials, fitness gear, and more — at unbeatable prices.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/30"
                >
                  Shop All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?filter=sale"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                >
                  View Sales
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-indigo-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-indigo-400" />
                  Free shipping $50+
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4 text-indigo-400" />
                  30-day returns
                </div>
              </div>
            </div>

            {/* Hero product mosaic */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`relative overflow-hidden rounded-2xl bg-white/10 border border-white/10 hover:border-white/30 transition-all group ${i === 0 ? "row-span-2" : ""}`}
                  style={{ aspectRatio: i === 0 ? "auto" : "1" }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-xs font-medium truncate">{product.name}</p>
                    <p className="text-indigo-300 text-sm font-bold">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { value: "50,000+", label: "Happy Customers" },
              { value: "500+", label: "Products" },
              { value: "4.8★", label: "Average Rating" },
              { value: "150+", label: "Countries Shipped" },
            ].map(({ value, label }) => (
              <div key={label} className="px-6 py-6 text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
                <Zap className="h-3.5 w-3.5" />
                Shop by Category
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              All products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all p-5 flex flex-col items-center text-center gap-3"
              >
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors flex items-center justify-center text-2xl">
                  {getCategoryEmoji(cat.slug)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700 transition-colors">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.productCount} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Most Popular
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
              <p className="text-gray-500 mt-2">The products our customers can&apos;t stop buying</p>
            </div>
            <Link href="/products?filter=best-seller" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNERS ────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-5">
            <Link href="/products?filter=sale" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 p-8 text-white group hover:shadow-xl transition-shadow">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -right-4 -bottom-12 h-60 w-60 rounded-full bg-white/5" />
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-widest text-red-200 mb-2">Limited Time</div>
                <h3 className="text-3xl font-bold mb-2">Up to 55% Off</h3>
                <p className="text-red-100 mb-6">On thousands of products. Don&apos;t miss out.</p>
                <div className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-xl text-sm group-hover:bg-red-50 transition-colors">
                  Shop the Sale <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
            <Link href="/products?filter=new" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white group hover:shadow-xl transition-shadow">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -right-4 -bottom-12 h-60 w-60 rounded-full bg-white/5" />
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-2">Just Dropped</div>
                <h3 className="text-3xl font-bold mb-2">New Arrivals</h3>
                <p className="text-indigo-100 mb-6">Fresh picks from top global suppliers.</p>
                <div className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl text-sm group-hover:bg-indigo-50 transition-colors">
                  Explore New <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-2">
                <Zap className="h-3.5 w-3.5" />
                Fresh Drops
              </div>
              <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 mt-2">Trending products, just landed</p>
            </div>
            <Link href="/products?filter=new" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP RATED ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
                <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                Customer Favorites
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Top Rated Products</h2>
              <p className="text-gray-500 mt-2">Verified 4.5+ star reviews</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {topRated.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────── */}
      <section className="py-16 bg-indigo-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Why Thousands Choose DropShop</h2>
          <p className="text-indigo-300 mb-12 max-w-xl mx-auto">
            We work directly with vetted global suppliers to bring you the best products at the lowest prices.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🌍", title: "Global Suppliers", desc: "Partnered with top-rated suppliers in 30+ countries for the best selection." },
              { icon: "⚡", title: "Fast Fulfillment", desc: "Orders processed within 24 hours. Track every shipment in real time." },
              { icon: "💰", title: "Best Price Guarantee", desc: "Found it cheaper? We'll match any price. No questions asked." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-indigo-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function getCategoryEmoji(slug: string) {
  const map: Record<string, string> = {
    electronics: "⚡", beauty: "✨", home: "🏠",
    fitness: "💪", fashion: "👗", pets: "🐾",
  };
  return map[slug] ?? "🛍️";
}
