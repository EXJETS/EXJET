"use client";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const total = subtotal();
  const shipping = total >= 50 ? 0 : total === 0 ? 0 : 5.99;
  const orderTotal = total + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart
            {items.length > 0 && <span className="ml-3 text-lg font-normal text-gray-400">({items.length} {items.length === 1 ? "item" : "items"})</span>}
          </h1>
          {items.length > 0 && (
            <button onClick={() => clearCart()} className="text-sm text-red-500 hover:text-red-700 transition-colors">Clear cart</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
            <ShoppingBag className="h-20 w-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Start adding your favorite products!</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                  <Link href={`/products/${product.slug}`} className="relative h-28 w-28 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">{product.category}</p>
                        <Link href={`/products/${product.slug}`} className="font-semibold text-gray-900 hover:text-indigo-700 transition-colors line-clamp-2">
                          {product.name}
                        </Link>
                      </div>
                      <button onClick={() => removeItem(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <Minus className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <Plus className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</p>
                        {quantity > 1 && <p className="text-xs text-gray-400">${product.price.toFixed(2)} each</p>}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      Ships in {product.shippingTime}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors mt-2">← Continue Shopping</Link>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Promo code" className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                  </div>
                  <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">Apply</button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free 🎉</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {total < 50 && total > 0 && (
                    <div className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">Add ${(50 - total).toFixed(2)} more for free shipping!</div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span><span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="mt-6 block w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200">
                  Checkout → ${orderTotal.toFixed(2)}
                </Link>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <span>🔒</span> SSL encrypted · 256-bit secure
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
