export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  images: string[];
  created_at: string;
  category?: Category;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderStatus = 'pending' | 'shipped' | 'delivered';
export type PaymentStatus = 'paid' | 'cod';

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  created_at: string;
  address_id: string;
  address?: Address;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
};

