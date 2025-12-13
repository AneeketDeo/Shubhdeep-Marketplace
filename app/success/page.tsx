import { getOrderById } from '@/lib/actions/orders';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function SuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrderById(orderId) : null;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  const deliveryDate = new Date(order.created_at);
  deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days delivery estimate

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-800 mb-8">
          Thank you for your order. We've received your order and will begin processing it right away.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-left">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-800">Order ID:</span>
              <span className="font-semibold text-gray-900">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Status:</span>
              <span className="font-semibold capitalize text-gray-900">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Payment:</span>
              <span className="font-semibold uppercase text-gray-900">{order.payment_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Total Amount:</span>
              <span className="font-semibold text-gray-900">₹{order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">
                {deliveryDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {order.address && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Delivery Address</h2>
            <p className="text-gray-900">
              {order.address.full_name}
              <br />
              {order.address.address_line}
              <br />
              {order.address.city}, {order.address.state} - {order.address.pincode}
              <br />
              Phone: {order.address.phone}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            href="/orders"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            View Orders
          </Link>
          <Link
            href="/category/all"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

