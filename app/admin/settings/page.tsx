"use client";

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setEnabled(typeof data.enabled === 'boolean' ? data.enabled : true);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const toggle = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      const data = await res.json();
      if (data.ok) setEnabled(!!data.enabled);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Razorpay (Online Payment)</h2>
            <p className="text-sm text-gray-800">Enable or disable Razorpay checkout option for customers.</p>
          </div>
          <div>
            {loading ? (
              <span className="text-gray-900">Loading…</span>
            ) : (
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={toggle}
                  disabled={saving}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
