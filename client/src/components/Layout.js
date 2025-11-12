import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut,
  Package,
  Users,
  BarChart3,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                E-Shop
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/products" className="nav-link">
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="relative nav-link">
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {totalItems}
                      </span>
                    )}
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 nav-link"
                    >
                      <User className="h-6 w-6" />
                      <span className="font-medium text-black hover:text-blue-600 transition-colors duration-200">{user?.firstName}</span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-black hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-black hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-black hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="btn btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-6 shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link to="/products" className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="relative nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {totalItems}
                      </span>
                    )}
                    <span className="ml-2">Cart</span>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 nav-link-mobile w-full"
                    >
                      <User className="h-6 w-6" />
                      <span className="font-medium">{user?.firstName}</span>
                    </button>
                    {isUserMenuOpen && (
                      <div className="mt-2 pl-4 flex flex-col space-y-2 bg-gray-50 rounded-lg py-2">
                        <Link
                          to="/profile"
                          className="nav-link-mobile-sub"
                          onClick={() => { setIsUserMenuOpen(false); setIsMenuOpen(false); }}
                        >
                          Profile
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="nav-link-mobile-sub"
                            onClick={() => { setIsUserMenuOpen(false); setIsMenuOpen(false); }}
                          >
                            <BarChart3 className="h-5 w-5 mr-2" /> Dashboard
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/products"
                            className="nav-link-mobile-sub"
                            onClick={() => { setIsUserMenuOpen(false); setIsMenuOpen(false); }}
                          >
                            <Package className="h-5 w-5 mr-2" /> Products
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/users"
                            className="nav-link-mobile-sub"
                            onClick={() => { setIsUserMenuOpen(false); setIsMenuOpen(false); }}
                          >
                            <Users className="h-5 w-5 mr-2" /> Users
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="nav-link-mobile-sub text-left"
                        >
                          <LogOut className="h-5 w-5 mr-2" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Admin Sidebar */}
      {isAdminRoute && isAuthenticated && user?.role === 'admin' && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-4">
              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  location.pathname === '/admin'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  location.pathname === '/admin/products'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  location.pathname === '/admin/orders'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  location.pathname === '/admin/users'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-auto shadow-2xl border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-blue-400" />
                <h3 className="text-2xl font-bold text-blue-400">E-Shop</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Your trusted online marketplace for quality products and excellent service.</p>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>123 Business Street, City, Country</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>support@eshop.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-blue-400 transition duration-300">Home</Link></li>
                <li><Link to="/products" className="text-gray-400 hover:text-blue-400 transition duration-300">Shop</Link></li>
                <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition duration-300">About Us</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition duration-300">Contact</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#faq" className="text-gray-400 hover:text-blue-400 transition duration-300">FAQ</a></li>
                <li><a href="#shipping" className="text-gray-400 hover:text-blue-400 transition duration-300">Shipping Info</a></li>
                <li><a href="#returns" className="text-gray-400 hover:text-blue-400 transition duration-300">Returns</a></li>
                <li><a href="#privacy" className="text-gray-400 hover:text-blue-400 transition duration-300">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Follow Us</h4>
              <p className="text-gray-400 text-sm mb-4">Connect with us on social media</p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-blue-500 hover:text-white transition duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-pink-600 hover:text-white transition duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 p-2 rounded-full text-gray-300 hover:bg-blue-700 hover:text-white transition duration-300">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} E-Shop. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#terms" className="hover:text-blue-400 transition duration-300">Terms of Service</a>
                <a href="#privacy" className="hover:text-blue-400 transition duration-300">Privacy Policy</a>
                <a href="#cookies" className="hover:text-blue-400 transition duration-300">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
