import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Truck, RotateCcw, ShieldCheck, Package } from "lucide-react";
import { products, getProductBySlug } from "@/data/products";
import { StarRating } from "@/components/shop/star-rating";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductCard } from "@/components/shop/product-card";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const badgeColors: Record<string, string> = {
    "Best Seller": "bg-amber-500", Hot: "bg-red-500", New: "bg-indigo-600", Sale: "bg-emerald-600", Limited: "bg-purple-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/category/${product.categorySlug}`} className="hover:text-indigo-600 transition-colors">{product.category}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium truncate max-w-48">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-gray-100 p-6 lg:p-10 shadow-sm">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
              {product.badge && (
                <span className={`absolute top-4 left-4 px-3 py-1.5 ${badgeColors[product.badge] ?? "bg-gray-700"} text-white text-sm font-semibold rounded-full`}>
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border-2 border-transparent hover:border-indigo-400 transition-colors cursor-pointer">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <Link href={`/category/${product.categorySlug}`} className="text-xs font-semibold text-indigo-600 uppercase tracking-wider hover:text-indigo-800">
                {product.category}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2 leading-tight">{product.name}</h1>
            </div>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">Save {discount}%</span>
                </>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {product.stockCount && product.stockCount < 20 && (
              <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                <Package className="h-4 w-4" />
                Only {product.stockCount} left in stock — order soon!
              </div>
            )}
            <AddToCartButton product={product} />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: `Ships in ${product.shippingTime}`, color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: RotateCcw, label: "30-day returns", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: ShieldCheck, label: "Secure payment", color: "text-purple-600", bg: "bg-purple-50" },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                  <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} strokeWidth={1.75} />
                  <p className={`text-xs font-medium ${color}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
