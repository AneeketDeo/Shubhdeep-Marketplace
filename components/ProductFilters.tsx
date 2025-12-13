'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types/database';
import { useState } from 'react';

type ProductFiltersProps = {
  categories: Category[];
  currentCategory: string;
  currentSort?: string;
};

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState(currentSort || '');

  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <select
        value={sort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
      >
        <option value="">Sort by</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}

