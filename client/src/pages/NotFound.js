import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ShoppingBag, ArrowRight, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-lg w-full relative z-10">
        <div className="text-center space-y-8 animate-fadeInUp">
          {/* Icon */}
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-60 animate-pulse-glow"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full transform hover:scale-110 transition-transform duration-300">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* 404 Text */}
          <div className="space-y-4">
            <h1 className="text-8xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-slideInRight">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The page you're looking for seems to have wandered off. 
              Don't worry, we'll help you get back on track!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <Link
              to="/"
              className="group py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/products"
              className="group py-3 px-6 border-2 border-purple-300 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Shop</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="pt-6 border-t border-gray-200 mt-8">
            <p className="text-sm text-gray-600 mb-4">Quick links:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="text-sm text-purple-600 hover:text-pink-600 font-medium transition-colors"
              >
                Browse All
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/"
                className="text-sm text-purple-600 hover:text-pink-600 font-medium transition-colors"
              >
                Home
              </Link>
              <span className="text-gray-300">•</span>
              <a
                href="#"
                className="text-sm text-purple-600 hover:text-pink-600 font-medium transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>

        {/* Floating Search Suggestion */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center space-x-3 mb-4">
            <Search className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Search for what you need:</span>
          </div>
          <input
            type="text"
            placeholder="Try searching for products..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
