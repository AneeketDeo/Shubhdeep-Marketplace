'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BulkUploadProducts() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    created?: number;
    failed?: number;
    validationErrors?: string[];
    error?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          created: data.created,
          failed: data.failed,
          validationErrors: data.validationErrors,
        });
        // Refresh the page after 2 seconds to show new products
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setResult({
          success: false,
          error: data.error || 'Upload failed',
          created: data.created,
          failed: data.failed,
          validationErrors: data.details || data.validationErrors,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to upload file',
      });
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <Upload className="h-5 w-5" />
        Bulk Upload Products
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Bulk Upload Products</h2>
              <button
                onClick={reset}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Excel File (.xlsx or .xls)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Required columns: title, description, price, stock, category (name or ID)
                </p>
                <p className="text-sm text-gray-500">
                  Note: Product images are excluded and can be added later
                </p>
              </div>

              {file && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Selected file:</strong> {file.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {result.success
                          ? result.message || 'Upload successful!'
                          : result.error || 'Upload failed'}
                      </p>
                      {result.created !== undefined && (
                        <p className="text-sm text-gray-600 mt-1">
                          Created: {result.created} | Failed: {result.failed || 0}
                        </p>
                      )}
                      {result.validationErrors &&
                        result.validationErrors.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Validation Errors:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                              {result.validationErrors.map((error, index) => (
                                <li key={index} className="list-disc list-inside">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
                >
                  {uploading ? 'Uploading...' : 'Upload Products'}
                </button>
                <button
                  onClick={reset}
                  disabled={uploading}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                >
                  {result?.success ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

