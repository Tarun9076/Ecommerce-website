import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  ChevronLeft, Package, Calendar, MapPin, Phone, Mail, 
  CreditCard, Truck, CheckCircle, Clock, AlertCircle, DollarSign,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useQuery(
    ['order', id],
    () => axios.get(`/api/orders/${id}`).then(res => res.data),
    {
      staleTime: 2 * 60 * 1000,
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to load order');
      }
    }
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Delivered' },
      processing: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Truck, label: 'Processing' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle, label: 'Cancelled' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order?.order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
            <button
              onClick={() => navigate('/orders')}
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Orders</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderData = order.order;
  const statusConfig = getStatusBadge(orderData.status);
  const StatusIcon = statusConfig.icon;

  const subtotal = orderData.totalAmount;
  const shipping = orderData.shippingAddress ? 0 : 0;
  const tax = orderData.totalAmount * 0.1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Order #{orderData._id?.slice(-8)}</h1>
              <p className="text-gray-600">
                <Calendar className="h-4 w-4 inline mr-2" />
                {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
                <StatusIcon className="h-5 w-5" />
                <span className="font-semibold">{statusConfig.label}</span>
              </div>
              <button
                onClick={handlePrint}
                className="btn btn-outline flex items-center space-x-2 print:hidden"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6 animate-slideInRight">
            {/* Items Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <span>Order Items</span>
              </h2>
              
              <div className="space-y-4">
                {orderData.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                  >
                    {item.product?.images?.[0]?.url && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.product?.name}</h3>
                      {item.product?.brand && (
                        <p className="text-sm text-gray-600">{item.product.brand}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{(item.product?.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {orderData.shippingAddress && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-fadeInUp">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-purple-600" />
                  <span>Shipping Address</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recipient</p>
                    <p className="font-bold text-gray-900">
                      {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-bold text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      {orderData.shippingAddress.phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-bold text-gray-900">
                      {orderData.shippingAddress.street}, {orderData.shippingAddress.city}
                    </p>
                    <p className="text-gray-700">
                      {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}, {orderData.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 animate-scaleIn">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-24 space-y-6">
              {/* Price Breakdown */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Price Breakdown</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{(subtotal + shipping + tax).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <span>Payment</span>
                </h3>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Method:</span> {orderData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Other'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Status:</span> <span className="text-green-600">Paid</span>
                  </p>
                </div>
              </div>

              {/* Contact Support */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toast.success('Support contact will be added soon!')}
                  className="w-full btn btn-secondary py-2 text-center rounded-lg flex items-center justify-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none; }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
