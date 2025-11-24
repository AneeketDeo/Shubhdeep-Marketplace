'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createOrder } from '@/lib/actions/orders';
import Script from 'next/script';

const addressSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address_line: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Load Razorpay enabled flag from admin settings API
  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const val = typeof data.enabled === 'boolean' ? data.enabled : true;
        setRazorpayEnabled(val);
        if (!val) setPaymentMethod('cod');
      })
      .catch(() => {
        /* ignore, keep default enabled */
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Prefill the address form from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shippingAddress');
      if (saved) {
        const parsed = JSON.parse(saved);
        // ensure parsed matches the shape we expect
        reset(parsed);
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }, [reset]);

  // Persist address to localStorage as the user types
  const watchedValues = watch();
  useEffect(() => {
    try {
      // Avoid writing undefined/empty objects
      if (watchedValues && Object.keys(watchedValues).length > 0) {
        localStorage.setItem('shippingAddress', JSON.stringify(watchedValues));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [watchedValues]);

  const handleRazorpayPayment = async (orderId: string) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: getTotal() * 100, // Amount in paise
        currency: 'INR',
        name: 'Shubhdeep Marketplace',
        description: 'Order Payment',
        order_id: orderId,
        handler: function (response: any) {
          resolve(response);
        },
        prefill: {
          name: '',
          email: user?.email || '',
          contact: '',
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        reject(new Error(response.error.description));
      });
      razorpay.open();
    });
  };

  const onSubmit = async (data: AddressFormData) => {
    // Save address snapshot to localStorage
    try {
      localStorage.setItem('shippingAddress', JSON.stringify(data));
    } catch (e) {
      // ignore storage errors
    }
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || 'guest-' + Date.now();

      let razorpayOrderId: string | undefined;

      if (paymentMethod === 'razorpay') {
        // Create Razorpay order
        const response = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: getTotal() }),
        });

        const razorpayData = await response.json();
        if (!razorpayData.orderId) {
          throw new Error('Failed to create Razorpay order');
        }

        razorpayOrderId = razorpayData.orderId;

        // Handle Razorpay payment
  await handleRazorpayPayment(razorpayOrderId!);
      }

      // Create order in database
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrder({
        userId,
        items: orderItems,
        address: data,
        paymentMethod,
        razorpayOrderId,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      clearCart();
      router.push(`/success?orderId=${result.orderId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link
          href="/category/all"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Delivery Address</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  {...register('full_name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  {...register('address_line')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.address_line && (
                  <p className="text-red-500 text-sm mt-1">{errors.address_line.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    {...register('city')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    {...register('state')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                <input
                  {...register('pincode')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="space-y-2">
                  {razorpayEnabled && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                        className="w-4 h-4"
                      />
                      <span>Razorpay (Online Payment)</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                      className="w-4 h-4"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

