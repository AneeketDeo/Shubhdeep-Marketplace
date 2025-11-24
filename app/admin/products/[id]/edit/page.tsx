import { getProductById } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/products';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/ProductForm';

type PageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: PageProps) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}

