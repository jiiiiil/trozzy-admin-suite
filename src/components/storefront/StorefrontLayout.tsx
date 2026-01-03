import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

interface StorefrontLayoutProps {
  children: ReactNode;
}

export const StorefrontLayout = ({ children }: StorefrontLayoutProps) => {
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const customer = JSON.parse(localStorage.getItem('trozzy_customer') || 'null');

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-stone-900 text-white text-center py-2 px-4">
        <p className="text-xs tracking-widest uppercase">
          Complimentary shipping on orders over $150
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-stone-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-10">
              <Link 
                to="/shop" 
                className="text-stone-600 text-sm tracking-widest uppercase hover:text-stone-900 transition-colors"
              >
                Shop
              </Link>
              <Link 
                to="/collections" 
                className="text-stone-600 text-sm tracking-widest uppercase hover:text-stone-900 transition-colors"
              >
                Collections
              </Link>
              <Link 
                to="/about" 
                className="text-stone-600 text-sm tracking-widest uppercase hover:text-stone-900 transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Logo */}
            <Link to="/home" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="font-serif text-2xl tracking-widest text-stone-900">
                TROZZY
              </h1>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-stone-600 hover:text-stone-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link 
                to={customer ? "/account" : "/login"} 
                className="text-stone-600 hover:text-stone-900 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
              <Link 
                to="/cart" 
                className="text-stone-600 hover:text-stone-900 transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-stone-900 text-white text-[10px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-stone-200 py-4 px-6">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-6 px-6">
            <nav className="space-y-4">
              <Link 
                to="/shop" 
                className="block text-stone-600 text-sm tracking-widest uppercase hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/collections" 
                className="block text-stone-600 text-sm tracking-widest uppercase hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collections
              </Link>
              <Link 
                to="/about" 
                className="block text-stone-600 text-sm tracking-widest uppercase hover:text-stone-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h2 className="font-serif text-xl tracking-widest text-stone-900 mb-4">TROZZY</h2>
              <p className="text-stone-500 text-sm leading-relaxed">
                Timeless pieces for the discerning individual.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-stone-900 text-xs tracking-widest uppercase mb-4">Shop</p>
              <nav className="space-y-3">
                <Link to="/shop" className="block text-stone-500 text-sm hover:text-stone-900 transition-colors">All Products</Link>
                <Link to="/collections" className="block text-stone-500 text-sm hover:text-stone-900 transition-colors">Collections</Link>
                <Link to="/shop" className="block text-stone-500 text-sm hover:text-stone-900 transition-colors">New Arrivals</Link>
              </nav>
            </div>

            <div>
              <p className="text-stone-900 text-xs tracking-widest uppercase mb-4">Support</p>
              <nav className="space-y-3">
                <Link to="/contact" className="block text-stone-500 text-sm hover:text-stone-900 transition-colors">Contact</Link>
                <Link to="/shipping" className="block text-stone-500 text-sm hover:text-stone-900 transition-colors">Shipping</Link>
                <Link to="/returns" className="block text-stone-500 text-sm hover:text-stone-900 transition-colors">Returns</Link>
              </nav>
            </div>

            <div>
              <p className="text-stone-900 text-xs tracking-widest uppercase mb-4">Newsletter</p>
              <p className="text-stone-500 text-sm mb-4">Receive updates on new arrivals and exclusive offers.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 border border-stone-300 border-r-0 px-4 py-2 text-sm focus:outline-none"
                />
                <button className="bg-stone-900 text-white px-4 py-2 text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-400 text-xs">© 2024 Trozzy. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-stone-400 text-xs hover:text-stone-700 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-stone-400 text-xs hover:text-stone-700 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
