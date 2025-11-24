'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState as useReactState } from 'react';

export function Navbar() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [user, setUser] = useReactState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    // mark client mount to avoid hydration mismatches for client-only values
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/all?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Shubhdeep Marketplace
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <User className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/products"
              className="text-gray-700 hover:text-blue-600 text-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

