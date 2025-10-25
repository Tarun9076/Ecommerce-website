import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const { data: featuredProducts, isLoading } = useQuery(
    'featured-products',
    () => axios.get('/api/products?featured=true&limit=8').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setSubscribing(true);
    try {
      const response = await axios.post('/api/newsletter/subscribe', { email });
      if (response.data.success) {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
    } finally {
      setSubscribing(false);
    }
  };

  const features = [
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: 'Secure Payment',
      description: 'Your payment information is safe and secure'
    },
    {
      icon: <RotateCcw className="h-8 w-8 text-purple-600" />,
      title: 'Easy Returns',
      description: '30-day return policy for all products'
    }
  ];

  const categories = [
    { name: 'Electronics', image: '/api/placeholder/300/200', link: '/products?category=electronics' },
    { name: 'Clothing', image: '/api/placeholder/300/200', link: '/products?category=clothing' },
    { name: 'Home & Garden', image: '/api/placeholder/300/200', link: '/products?category=home' },
    { name: 'Books', image: '/api/placeholder/300/200', link: '/products?category=books' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="container py-24 relative z-10">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6 border border-white/30 backdrop-blur-sm">
              🚀 New Collection Available
            </span>
            <h1 className="heading-1 mb-6 text-white">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Shop the latest trends and find everything you need in one place. 
              Quality products, great prices, and fast delivery. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/products" 
                className="btn bg-white text-blue-600 hover:bg-gray-100 hover:shadow-xl font-semibold"
              >
                Shop Now
              </Link>
              <Link 
                to="/products?featured=true" 
                className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 hover:shadow-xl font-semibold"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 group"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-50 p-4 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-2">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our wide selection of products organized by category
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden"
              >
                <div className="relative bg-gray-100 h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-center">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6">
            <div className="animate-fadeInUp">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                ⭐ HANDPICKED FOR YOU
              </span>
              <h2 className="heading-2 mb-2 text-gray-900">Featured Products</h2>
              <p className="text-gray-600 text-lg">Discover our best-selling and most-loved items</p>
            </div>
            <Link
              to="/products?featured=true"
              className="btn btn-outline flex items-center space-x-2 hover:shadow-lg animate-slideInRight"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid-responsive">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="product-card">
                  <div className="skeleton h-48 w-full mb-4"></div>
                  <div className="p-4">
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-4 w-1/2 mb-4"></div>
                    <div className="skeleton h-6 w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-responsive">
              {featuredProducts?.products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section bg-blue-600 text-white">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Mail className="h-8 w-8" />
              </div>
            </div>
            <h2 className="heading-2 mb-2">Stay Updated with Latest Deals</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Subscribe to our newsletter and get exclusive offers, new product launches, 
              and insider tips delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-3 mb-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              />
              <button 
                type="submit"
                disabled={subscribing}
                className="btn bg-white text-blue-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {subscribing ? (
                  <span className="inline-block loading-spinner h-5 w-5"></span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            <p className="text-blue-200 text-sm">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
