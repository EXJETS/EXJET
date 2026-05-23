import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories, getProductsByCategory } from "@/data/products";
import { ProductCard } from "@/components/shop/product-card";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return { title: cat.name, description: cat.description };
}

const emojiMap: Record<string, string> = {
  electronics: "⚡", beauty: "✨", home: "🏠", fitness: "💪", fashion: "👗", pets: "🐾",
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const catProducts = getProductsByCategory(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-5xl mb-4">{emojiMap[slug] ?? "🛍️"}</div>
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-indigo-200 text-lg">{category.description}</p>
          <p className="text-indigo-300 text-sm mt-2">{catProducts.length} products</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {catProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-900">No products yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {catProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop Other Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.filter((c) => c.slug !== slug).map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors">
                <span>{emojiMap[cat.slug] ?? "🛍️"}</span>{cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
