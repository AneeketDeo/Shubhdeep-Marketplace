import { getProducts, getCategories } from '@/lib/actions/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';

type PageProps = {
  params: { id: string };
  searchParams: { search?: string; sort?: string };
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [products, categories] = await Promise.all([
    getProducts({
      categoryId: params.id,
      search: searchParams.search,
      sortBy: searchParams.sort as 'price_asc' | 'price_desc' | undefined,
    }),
    getCategories(),
  ]);

  const categoryName =
    categories.find((c) => c.id === params.id)?.name || 'All Products';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        <ProductFilters
          categories={categories}
          currentCategory={params.id}
          currentSort={searchParams.sort}
        />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

