import { createClient } from '@/lib/supabase/server';
import { Product, Category } from '@/lib/types/database';

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc';
}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .gt('stock', 0);

  if (filters?.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters?.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (filters?.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data || [];
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .gt('stock', 0)
    .limit(4);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}

