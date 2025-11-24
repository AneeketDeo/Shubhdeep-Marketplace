'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/lib/actions/orders';
import { useRouter } from 'next/navigation';

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: 'pending' | 'shipped' | 'delivered';
};

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'pending' | 'shipped' | 'delivered';
    setStatus(newStatus);
    setLoading(true);

    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.success) {
      alert(result.error || 'Failed to update status');
      setStatus(currentStatus);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
        status === 'delivered'
          ? 'bg-green-100 text-green-800'
          : status === 'shipped'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      <option value="pending">Pending</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
    </select>
  );
}

