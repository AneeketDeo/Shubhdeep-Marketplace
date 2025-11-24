export function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Shubhdeep Marketplace</h3>
            <p className="text-gray-400">
              Your trusted source for quality stationery products.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/category/all" className="hover:text-white">
                  All Products
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-white">
                  My Orders
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: support@shubhdeep.com</p>
            <p className="text-gray-400">Phone: +91 1234567890</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Shubhdeep Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

