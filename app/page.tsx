import Link from 'next/link';
import { getCategories, getFeaturedProducts } from '@/lib/actions/products';
import { ProductCard } from '@/components/ProductCard';

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12 mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Shubhdeep Marketplace</h1>
        <p className="text-xl mb-6">Your one-stop shop for all stationery needs</p>
        <Link
          href="/category/all"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-blue-500 transition hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

