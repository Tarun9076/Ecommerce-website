import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Order statuses
  const orderStatuses = [
    'pending', 
    'processing', 
    'shipped', 
    'delivered', 
    'cancelled'
  ];

  // Status icons and colors
  const statusConfig = {
    pending: { icon: <Clock size={16} />, color: 'bg-yellow-100 text-yellow-800' },
    processing: { icon: <Package size={16} />, color: 'bg-blue-100 text-blue-800' },
    shipped: { icon: <Truck size={16} />, color: 'bg-purple-100 text-purple-800' },
    delivered: { icon: <CheckCircle size={16} />, color: 'bg-green-100 text-green-800' },
    cancelled: { icon: <XCircle size={16} />, color: 'bg-red-100 text-red-800' }
  };

  // Fetch orders with filters
  const { data, isLoading, error } = useQuery(
    ['adminOrders', page, limit, searchTerm, status],
    async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (searchTerm) params.append('search', searchTerm);
      if (status) params.append('status', status);
      
      const response = await axios.get(`/api/orders/admin?${params.toString()}`, getAuthHeaders());
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  // Update order status mutation
  const updateStatusMutation = useMutation(
    async ({ orderId, status }) => {
      const response = await axios.put(`/api/orders/${orderId}/status`, { status }, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        toast.success('Order status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order status');
      }
    }
  );

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatus('');
    setPage(1);
  };

  // View order details
  const viewOrderDetails = (order) => {
    setCurrentOrder(order);
    setShowOrderModal(true);
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
    if (currentOrder && currentOrder._id === orderId) {
      setCurrentOrder({
        ...currentOrder,
        status: newStatus
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate order total
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-1">Order Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <select
                className="input-field pl-10 pr-8 appearance-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {orderStatuses.map((stat) => (
                  <option key={stat} value={stat}>
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">
              Apply Filters
            </button>
            {(searchTerm || status) && (
              <button 
                type="button" 
                className="btn-outline flex items-center gap-1"
                onClick={clearFilters}
              >
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={40} className="mx-auto mb-2" />
            <p>Error loading orders. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.orders.length > 0 ? (
                    data.orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {order._id.substring(order._id.length - 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {order.user?.name || 'Guest User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingAddress?.email || 'No email provided'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ₹{calculateOrderTotal(order).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusConfig[order.status]?.icon}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button 
                            className="btn-outline text-sm py-1 px-2 flex items-center gap-1"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye size={16} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No orders found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.totalOrders)} of {data.pagination.totalOrders} orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="btn-outline p-2"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    className="btn-outline p-2"
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Order #{currentOrder._id.substring(currentOrder._id.length - 8).toUpperCase()}
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowOrderModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(currentOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[currentOrder.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusConfig[currentOrder.status]?.icon}
                        {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Payment:</span>
                      <span>{currentOrder.paymentMethod || 'Online'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Currency:</span>
                      <span>{currentOrder.currency || 'INR'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{currentOrder.user?.name || currentOrder.shippingAddress?.name || 'Guest User'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{currentOrder.user?.email || currentOrder.shippingAddress?.email || 'No email provided'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">{currentOrder.shippingAddress?.phone || 'No phone provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {currentOrder.shippingAddress ? (
                    <>
                      <p>{currentOrder.shippingAddress.street}</p>
                      <p>
                        {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.postalCode}
                      </p>
                      <p>{currentOrder.shippingAddress.country}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Order Items</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {item.image && (
                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 mr-3">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{item.name}</div>
                                {item.productId && (
                                  <div className="text-xs text-gray-500">ID: {item.productId.substring(0, 8)}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm font-medium text-right">Subtotal:</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ₹{calculateOrderTotal(currentOrder).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm font-medium text-right">Shipping:</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ₹{(currentOrder.shippingCost || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-base font-bold text-right">Total:</td>
                        <td className="px-4 py-3 text-base text-right font-bold">
                          ₹{(calculateOrderTotal(currentOrder) + (currentOrder.shippingCost || 0)).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Update Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  {orderStatuses.map((stat) => (
                    <button
                      key={stat}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentOrder.status === stat 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      disabled={currentOrder.status === stat}
                      onClick={() => updateOrderStatus(currentOrder._id, stat)}
                    >
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowOrderModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
