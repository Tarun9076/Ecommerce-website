import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ChevronRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  
  if (!items) {
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
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const stripe = useStripe();
  const elements = useElements();
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: user?.phone || ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: user?.phone || ''
  });
  
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Calculate totals
  const subtotal = Number(totalPrice) || 0;
  const shipping = subtotal >= 50 ? 0 : 5;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  // Fetch cart data
  const { data: cartData, isLoading: isCartLoading } = useQuery('cart', async () => {
    const response = await axios.get('/api/cart');
    return response.data;
  });
  
  // Create payment intent mutation
  const createPaymentIntent = useMutation(async () => {
    try {
      const response = await axios.post('/api/orders/create-payment-intent', {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress
      });
      
      setClientSecret(response.data.clientSecret);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating payment intent');
      throw error;
    }
  });
  
  // Create order mutation
  const createOrder = useMutation(async (paymentData) => {
    try {
      const response = await axios.post('/api/orders', {
        paymentIntentId: paymentData.paymentIntent.id,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod
      });
      
      setOrderId(response.data.order._id);
      setOrderComplete(true);
      
      // Clear cart after successful order
      await clearCart();
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating order');
      throw error;
    }
  });
  
  // Handle shipping form change
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    
    if (sameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle billing form change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox change
  const handleSameAsShippingChange = (e) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) {
      setBillingAddress(shippingAddress);
    }
  };
  
  // Handle next step
  const handleNextStep = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate shipping form
      const requiredFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !shippingAddress[field]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill all required shipping fields');
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      // Validate billing form if not same as shipping
      if (!sameAsShipping) {
        const requiredFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode', 'phone'];
        const missingFields = requiredFields.filter(field => !billingAddress[field]);
        
        if (missingFields.length > 0) {
          toast.error('Please fill all required billing fields');
          return;
        }
      }
      
      // Create payment intent
      try {
        setLoading(true);
        await createPaymentIntent.mutateAsync();
        setStep(3);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error creating payment intent');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  // Handle payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${billingAddress.firstName} ${billingAddress.lastName}`,
            email: user?.email || '',
            phone: billingAddress.phone,
            address: {
              line1: billingAddress.street,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.zipCode,
              country: billingAddress.country
            }
          }
        }
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Create order
        await createOrder.mutateAsync({ paymentIntent });
        toast.success('Payment successful! Order has been placed.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during payment');
      toast.error(error.message || 'An error occurred during payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Redirect to cart if empty
  useEffect(() => {
    if ((items?.length ?? 0) === 0 && !isCartLoading && !orderComplete) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items, isCartLoading, navigate, orderComplete]);
  
  if (isCartLoading) {
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
  
  if (orderComplete) {
    return (
      <div className="section">
        <div className="container max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="heading-1 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order has been placed and will be processed soon.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order ID:</span>
                <span>{orderId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span>Credit Card</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <span>View Orders</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn btn-outline flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Checkout Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex-1 flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Shipping</span>
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Billing</span>
              </div>
              <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {step === 1 && (
                  <form onSubmit={handleNextStep}>
                    <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={shippingAddress.firstName}
                          onChange={handleShippingChange}
                          className="input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={shippingAddress.lastName}
                          onChange={handleShippingChange}
                          className="input w-full"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleShippingChange}
                        className="input w-full"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                          className="input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleShippingChange}
                          className="input w-full"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={handleShippingChange}
                          className="input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={shippingAddress.country}
                          onChange={handleShippingChange}
                          className="input w-full"
                          required
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleShippingChange}
                        className="input w-full"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Cart</span>
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <span>Continue to Billing</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}
                
                {step === 2 && (
                  <form onSubmit={handleNextStep}>
                    <h2 className="text-xl font-bold mb-6">Billing Information</h2>
                    
                    <div className="mb-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={handleSameAsShippingChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Same as shipping address
                        </span>
                      </label>
                    </div>
                    
                    {!sameAsShipping && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name *
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={billingAddress.firstName}
                              onChange={handleBillingChange}
                              className="input w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={billingAddress.lastName}
                              onChange={handleBillingChange}
                              className="input w-full"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={billingAddress.street}
                            onChange={handleBillingChange}
                            className="input w-full"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={billingAddress.city}
                              onChange={handleBillingChange}
                              className="input w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State/Province *
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={billingAddress.state}
                              onChange={handleBillingChange}
                              className="input w-full"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              name="zipCode"
                              value={billingAddress.zipCode}
                              onChange={handleBillingChange}
                              className="input w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Country *
                            </label>
                            <select
                              name="country"
                              value={billingAddress.country}
                              onChange={handleBillingChange}
                              className="input w-full"
                              required
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={billingAddress.phone}
                            onChange={handleBillingChange}
                            className="input w-full"
                            required
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Shipping</span>
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <span>Continue to Payment</span>
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
                
                {step === 3 && (
                  <form onSubmit={handlePaymentSubmit}>
                    <h2 className="text-xl font-bold mb-6">Payment Information</h2>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer bg-blue-50 border-blue-200">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 flex items-center">
                            <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                            <span>Credit / Debit Card</span>
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Details
                        </label>
                        <div className="p-4 border rounded-md bg-gray-50">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#424770',
                                  '::placeholder': {
                                    color: '#aab7c4',
                                  },
                                },
                                invalid: {
                                  color: '#9e2146',
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Billing</span>
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                        disabled={loading || !stripe}
                      >
                        {loading ? (
                          <span>Processing...</span>
                        ) : (
                          <span>Complete Order</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {(items || []).filter(Boolean).map((item, idx) => (
                    <div key={item?.product?._id || item?.id || item?.product?.name || idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item?.product?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                          alt={item?.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item?.product?.name || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item?.quantity || 0}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(((item?.product?.price || 0) * (item?.quantity || 0))).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
