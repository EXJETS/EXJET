"use client";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, subtotal } = useCartStore();
  const total = subtotal();
  const shipping = total >= 50 ? 0 : 5.99;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">
              Your Cart{" "}
              <span className="text-gray-400 font-normal text-sm">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Free shipping banner */}
        {total < 50 && total > 0 && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-indigo-50 rounded-xl text-sm text-indigo-700">
            Add <strong>${(50 - total).toFixed(2)}</strong> more for free shipping!
          </div>
        )}
        {total >= 50 && total > 0 && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-emerald-50 rounded-xl text-sm text-emerald-700 font-medium">
            🎉 You qualify for free shipping!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-200" />
              <div>
                <p className="font-semibold text-gray-900">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Start adding products!</p>
              </div>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3 w-3 text-gray-500" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${(total + shipping).toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/shop/checkout"
              onClick={() => setOpen(false)}
              className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold rounded-xl transition-colors"
            >
              Checkout → ${(total + shipping).toFixed(2)}
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="block w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 text-center transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
