"use client";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { products, categories } from "@/data/products";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const filterOptions = [
  { value: "best-seller", label: "Best Seller" },
  { value: "new", label: "New Arrivals" },
  { value: "sale", label: "On Sale" },
  { value: "hot", label: "Hot" },
];

export function ProductsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") ?? "";
  const initialQuery = searchParams.get("q") ?? "";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];
    if (initialQuery) {
      const q = initialQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))
      );
    }
    if (activeCategory !== "all") result = result.filter((p) => p.categorySlug === activeCategory);
    if (activeFilter === "best-seller") result = result.filter((p) => p.badge === "Best Seller");
    else if (activeFilter === "new") result = result.filter((p) => p.badge === "New" || p.badge === "Hot");
    else if (activeFilter === "sale") result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    else if (activeFilter === "hot") result = result.filter((p) => p.badge === "Hot");
    result = result.filter((p) => p.price <= maxPrice);
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest") result.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    return result;
  }, [activeCategory, activeFilter, sortBy, maxPrice, initialQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {initialQuery ? `Search: "${initialQuery}"` : "All Products"}
              </h1>
              <p className="text-gray-500 mt-1">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters((o) => !o)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                  showFilters ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:border-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn("shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeCategory === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
            >All</button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn("shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeCategory === cat.slug ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {showFilters && (
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-28 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Filter by</h3>
                    {(activeFilter || activeCategory !== "all") && (
                      <button onClick={() => { setActiveFilter(""); setActiveCategory("all"); }} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <X className="h-3 w-3" />Clear
                      </button>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {filterOptions.map((f) => (
                      <li key={f.value}>
                        <button
                          onClick={() => setActiveFilter((cur) => cur === f.value ? "" : f.value)}
                          className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", activeFilter === f.value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50")}
                        >
                          {f.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Max Price: <span className="text-indigo-600">${maxPrice}</span>
                  </h3>
                  <input type="range" min={10} max={200} step={5} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-indigo-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$10</span><span>$200</span></div>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            {(activeFilter || maxPrice < 200) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    {filterOptions.find((f) => f.value === activeFilter)?.label}
                    <button onClick={() => setActiveFilter("")}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {maxPrice < 200 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    Under ${maxPrice}
                    <button onClick={() => setMaxPrice(200)}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
