"use client";
import { useState } from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Minus className="h-4 w-4 text-gray-500" />
          </button>
          <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      <button
        onClick={handleAdd}
        disabled={!product.inStock}
        className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all ${
          added ? "bg-emerald-600 text-white" :
          product.inStock ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-[0.98]" :
          "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {added ? (
          <><Check className="h-5 w-5" />Added to Cart!</>
        ) : (
          <><ShoppingCart className="h-5 w-5" />{product.inStock ? `Add to Cart — $${(product.price * quantity).toFixed(2)}` : "Out of Stock"}</>
        )}
      </button>
      <p className="text-center text-xs text-gray-400">🔒 Secure checkout · Free returns within 30 days</p>
    </div>
  );
}
