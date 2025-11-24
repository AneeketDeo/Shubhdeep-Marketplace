import { getCategories } from '@/lib/actions/products';
import { ProductForm } from '@/components/ProductForm';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

