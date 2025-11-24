# Quick Start Guide

Get your Shubhdeep Marketplace up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:
- Supabase project URL and keys
- Razorpay test keys
- Admin email address

### 3. Set Up Supabase Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts from `DEPLOYMENT.md` in your Supabase SQL Editor
3. Create the `product-images` storage bucket (see DEPLOYMENT.md for details)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

1. **Create Admin Account:**
   - Sign up with the email address you set in `ADMIN_EMAIL`
   - Access admin panel at `/admin/products`

2. **Add Categories:**
   - Categories are created via SQL (see DEPLOYMENT.md)
   - Or add them directly in Supabase dashboard

3. **Add Products:**
   - Go to `/admin/products`
   - Click "Add Product"
   - Upload images, fill in details, and save

4. **Test the Flow:**
   - Browse products on homepage
   - Add items to cart
   - Proceed to checkout
   - Test with Razorpay test mode or Cash on Delivery

## Testing Payments

For Razorpay test mode:
- Use test card: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV

## Need Help?

See `DEPLOYMENT.md` for detailed setup instructions and troubleshooting.

