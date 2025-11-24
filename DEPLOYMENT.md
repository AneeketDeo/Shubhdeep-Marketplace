# Deployment Guide - Shubhdeep Marketplace

This guide will help you deploy the Shubhdeep Marketplace application to production.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Razorpay account (test mode for development)
- Vercel account (for frontend deployment)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 1.2 Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  payment_status TEXT NOT NULL DEFAULT 'cod' CHECK (payment_status IN ('paid', 'cod')),
  total_amount NUMERIC(10, 2) NOT NULL,
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Function to decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id AND stock >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert sample categories
INSERT INTO categories (name) VALUES
  ('Pens & Pencils'),
  ('Notebooks'),
  ('Art Supplies'),
  ('Office Supplies'),
  ('School Supplies');
```

### 1.3 Storage Bucket Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `product-images`
3. Set it to **Public** bucket
4. Add the following policy (RLS Policy):

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
```

### 1.4 Row Level Security (RLS)

Enable RLS and add policies:

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Products: Public read access
CREATE POLICY "Public read products" ON products
FOR SELECT USING (true);

-- Categories: Public read access
CREATE POLICY "Public read categories" ON categories
FOR SELECT USING (true);

-- Orders: Users can only see their own orders
CREATE POLICY "Users see own orders" ON orders
FOR SELECT USING (auth.uid()::text = user_id::text OR user_id LIKE 'guest-%');

-- Order items: Users can see items from their orders
CREATE POLICY "Users see own order items" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid()::text OR orders.user_id LIKE 'guest-%')
  )
);

-- Addresses: Users can see their own addresses
CREATE POLICY "Users see own addresses" ON addresses
FOR SELECT USING (auth.uid()::text = user_id::text OR user_id LIKE 'guest-%');
```

## Step 2: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

**Important:** Never commit `.env.local` to version control!

## Step 3: Razorpay Setup

1. Go to [razorpay.com](https://razorpay.com) and create an account
2. Navigate to Settings > API Keys
3. Generate test keys (for development) or live keys (for production)
4. Add the Key ID and Key Secret to your `.env.local`

## Step 4: Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Step 5: Vercel Deployment

### 5.1 Prepare for Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Make sure all environment variables are ready

### 5.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your repository
4. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

### 5.3 Add Environment Variables in Vercel

In your Vercel project settings, add all environment variables from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_ADMIN_EMAIL`

### 5.4 Deploy

Click "Deploy" and wait for the build to complete.

## Step 6: Post-Deployment

### 6.1 Create Admin User

1. Sign up with the admin email address you configured
2. The admin email should match `ADMIN_EMAIL` in your environment variables

### 6.2 Add Sample Data

You can add sample products through the admin panel at `/admin/products`

### 6.3 Test Payment Flow

1. Test with Razorpay test mode first
2. Use test card: `4111 1111 1111 1111`
3. Any future expiry date and any CVV

## Troubleshooting

### Common Issues

1. **"Invalid API key" errors:**
   - Verify all environment variables are set correctly in Vercel
   - Make sure you're using the correct Supabase project keys

2. **Image upload fails:**
   - Check that the `product-images` bucket exists and is public
   - Verify RLS policies are set correctly

3. **Orders not showing:**
   - Check RLS policies on orders and order_items tables
   - Verify user authentication is working

4. **Admin access denied:**
   - Ensure `ADMIN_EMAIL` matches the email you signed up with
   - Check that both `ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_EMAIL` are set

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Use environment variables for all sensitive data
- Enable RLS on all tables
- Regularly rotate API keys
- Use Razorpay webhooks to verify payments in production

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)

