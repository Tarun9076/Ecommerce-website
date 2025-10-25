import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, Calendar, DollarSign, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [sortBy, setSortBy] = useState('date');

  const { data: ordersData, isLoading, isError, refetch } = useQuery(
    'user-orders',
    () => axios.get('/api/orders').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const orders = ordersData?.orders || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'price-high') {
      return b.totalAmount - a.totalAmount;
    } else if (sortBy === 'price-low') {
      return a.totalAmount - b.totalAmount;
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="section">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="section">
        <div className="container">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Orders</h2>
            <p className="text-red-600 mb-4">Failed to load your orders. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div className="mb-8">
          <h1 className="heading-1 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Sort and Filter */}
        {orders.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input py-2 max-w-xs"
              >
                <option value="date">Newest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        )}

        {/* Orders List */}
        {sortedOrders.length > 0 ? (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="group block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Order ID */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order ID</p>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {order._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="font-semibold text-gray-900">
                          ₹{order.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-2">
                      <div className="flex-grow">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)} w-fit`}>
                          {getStatusIcon(order.status)}
                          <span className="font-semibold capitalize text-sm">{order.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Items ({order.items?.length || 0})</p>
                    <div className="flex flex-wrap gap-3">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {item.product?.images?.[0]?.url && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product?.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-xs text-gray-600">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-600 font-medium text-sm">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center border border-blue-100">
            <Package className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to place your first order!</p>
            <Link to="/products" className="btn btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
