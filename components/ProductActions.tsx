'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '@/lib/types/database';
import { deleteProduct } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProductActionsProps = {
  product: Product;
};

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setLoading(true);
    const result = await deleteProduct(product.id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete product');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${product.id}/edit`}
        className="text-blue-600 hover:text-blue-700"
      >
        <Edit className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

