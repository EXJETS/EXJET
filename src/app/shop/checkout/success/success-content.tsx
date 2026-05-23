"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Truck, ArrowRight, Mail } from "lucide-react";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "DS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const email = searchParams.get("email") ?? "your email";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="h-14 w-14 text-emerald-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
          <p className="text-gray-500 leading-relaxed">
            Thank you for your order. We&apos;ve received your payment and are preparing your items for shipment.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-6">
          {/* Order ID */}
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Order ID</p>
              <p className="text-lg font-bold text-gray-900 font-mono">{orderId}</p>
            </div>
            <div className="h-10 px-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-center text-sm font-semibold">
              Confirmed
            </div>
          </div>

          {/* Confirmation email */}
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
            <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
            <p className="text-sm text-indigo-700">
              Confirmation email sent to <strong>{email}</strong>
            </p>
          </div>

          {/* Steps */}
          <div className="px-6 py-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">What happens next?</p>
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircle,
                  color: "bg-emerald-100 text-emerald-600",
                  title: "Order Confirmed",
                  desc: "Your payment has been processed successfully.",
                  done: true,
                },
                {
                  icon: Package,
                  color: "bg-amber-100 text-amber-600",
                  title: "Processing & Packing",
                  desc: "Your items will be packed and ready within 24 hours.",
                  done: false,
                },
                {
                  icon: Truck,
                  color: "bg-blue-100 text-blue-600",
                  title: "Shipped & Delivered",
                  desc: "Estimated delivery in 3–14 business days. Tracking link via email.",
                  done: false,
                },
              ].map(({ icon: Icon, color, title, desc, done }) => (
                <div key={title} className="flex gap-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${done ? "text-emerald-700" : "text-gray-900"}`}>
                      {title} {done && "✓"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop/products"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-2xl hover:border-indigo-300 transition-colors text-sm"
          >
            Browse More Products
          </Link>
        </div>

        {/* Support */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Contact us at{" "}
          <a href="mailto:support@dropshop.com" className="text-indigo-600 hover:underline">
            support@dropshop.com
          </a>
        </p>
      </div>
    </div>
  );
}
