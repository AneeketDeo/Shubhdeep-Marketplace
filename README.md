# Shubhdeep Marketplace - Stationery E-commerce Platform

A complete MVP for an online Stationery Marketplace built with Next.js 14, Supabase, and Razorpay.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Authentication & Database**: Supabase
- **Payments**: Razorpay
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Razorpay account (test mode)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_EMAIL=admin@example.com
```

3. Set up Supabase database:
See `DEPLOYMENT.md` for database schema setup instructions.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

### Customer Features
- Browse products by category
- Search and filter products
- Add to cart with quantity management
- Secure checkout with Razorpay or Cash on Delivery
- Order tracking
- User dashboard

### Admin Features
- Product management (CRUD)
- Image upload to Supabase Storage
- Order management
- Status updates (Pending → Shipped → Delivered)

## Project Structure

```
/app
  /admin          # Admin pages
  /product        # Product pages
  /category       # Category pages
  /cart           # Cart page
  /checkout       # Checkout page
  /orders         # User orders
  /success        # Order success page
/components       # Reusable components
/lib              # Utilities and configurations
```

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

