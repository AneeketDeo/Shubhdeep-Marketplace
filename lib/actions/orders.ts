'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order, OrderItem, Address } from '@/lib/types/database';

export async function createOrder(data: {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  address: Omit<Address, 'id' | 'user_id'>;
  paymentMethod: 'razorpay' | 'cod';
  razorpayOrderId?: string;
}): Promise<{ orderId: string; error?: string }> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  try {
    // Create or get address
    const { data: addressData, error: addressError } = await adminSupabase
      .from('addresses')
      .insert({
        user_id: data.userId,
        ...data.address,
      })
      .select()
      .single();

    if (addressError) {
      return { orderId: '', error: addressError.message };
    }

    // Calculate total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const { data: orderData, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        user_id: data.userId,
        status: 'pending',
        payment_status: data.paymentMethod === 'razorpay' ? 'paid' : 'cod',
        total_amount: totalAmount,
        address_id: addressData.id,
      })
      .select()
      .single();

    if (orderError) {
      return { orderId: '', error: orderError.message };
    }

    // Create order items
    const orderItems = data.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      return { orderId: '', error: itemsError.message };
    }

    // Update product stock
    for (const item of data.items) {
      await adminSupabase.rpc('decrement_stock', {
        product_id: item.productId,
        quantity: item.quantity,
      });
    }

    return { orderId: orderData.id };
  } catch (error: any) {
    return { orderId: '', error: error.message };
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, address:addresses(*), order_items:order_items(*, product:products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function getOrderById(
  orderId: string,
  userId?: string
): Promise<Order | null> {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('*, address:addresses(*), order_items:order_items(*, product:products(*))')
    .eq('id', orderId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function getAllOrders(): Promise<Order[]> {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('orders')
    .select('*, address:addresses(*), order_items:order_items(*, product:products(*))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'shipped' | 'delivered'
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

