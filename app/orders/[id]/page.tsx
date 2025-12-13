import { requireAuth } from '@/lib/actions/auth';
import { getOrderById } from '@/lib/actions/orders';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const order = await getOrderById(id, user.id);

  if (!order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
      >
        ← Back to Orders
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-gray-800">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.toUpperCase()}
            </span>
            <p className="text-sm text-gray-800 mt-2">
              Payment: {order.payment_status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-gray-200 pb-4"
                >
                  {item.product && (
                    <>
                      <div className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images?.[0] || 'https://via.placeholder.com/200x200?text=No+Image'}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                        <p className="text-gray-800 text-sm">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order.address && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Delivery Address</h2>
            <div className="bg-gray-50 rounded-lg p-4">
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
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Status</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-3 w-3 rounded-full ${
                order.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <div>
              <p className="font-semibold text-gray-900">Order Placed</p>
              <p className="text-sm text-gray-800">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`h-3 w-3 rounded-full ${
                order.status === 'shipped' || order.status === 'delivered'
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
            <div>
              <p className="font-semibold text-gray-900">Shipped</p>
              {order.status === 'shipped' || order.status === 'delivered' ? (
                <p className="text-sm text-gray-800">Your order has been shipped</p>
              ) : (
                <p className="text-sm text-gray-600">Pending</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`h-3 w-3 rounded-full ${
                order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <div>
              <p className="font-semibold text-gray-900">Delivered</p>
              {order.status === 'delivered' ? (
                <p className="text-sm text-gray-800">Your order has been delivered</p>
              ) : (
                <p className="text-sm text-gray-600">Pending</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

