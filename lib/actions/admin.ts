'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function createProduct(data: {
  title: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  images: string[];
}): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from('products').insert(data);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateProduct(
  id: string,
  data: {
    title: string;
    description: string;
    price: number;
    stock: number;
    category_id: string;
    images: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from('products').update(data).eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from('products').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

