"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { StarRating } from "./star-rating";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-amber-500 text-white",
  Hot: "bg-red-500 text-white",
  New: "bg-indigo-600 text-white",
  Sale: "bg-emerald-600 text-white",
  Limited: "bg-purple-600 text-white",
};

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:border-gray-200",
        className
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-gray-50 aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide",
              badgeColors[product.badge]
            )}
          >
            {product.badge}
          </span>
        )}
        {/* Discount badge */}
        {discount && discount >= 20 && (
          <span className="absolute top-3 right-3 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            -{discount}%
          </span>
        )}
        {/* Wishlist */}
        <button
          className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-gray-500" />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">
          {product.category}
        </div>
        <Link href={`/products/${product.slug}`} className="hover:text-indigo-700 transition-colors">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

        <div className="text-[11px] text-gray-400 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ships in {product.shippingTime}
        </div>
      </div>
    </div>
  );
}
