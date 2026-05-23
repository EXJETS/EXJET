import { Suspense } from "react";
import { ProductsContent } from "./products-content";

export const metadata = {
  title: "All Products",
  description: "Browse our full collection of best-selling products.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
