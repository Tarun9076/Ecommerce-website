import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const cartContext = useCart() || {};
  const {
    items = [],
    totalPrice = 0,
    loading = false,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = cartContext;

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    const result = await updateCartItem(productId, newQuantity);
    if (!result.success) {
          toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (window.confirm(`Remove ${productName} from cart?`)) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      const result = await clearCart();
      if (result.success) {
        toast.success('Cart cleared');
      }
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const [promoCode, setPromoCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [promoLoading, setPromoLoading] = React.useState(false);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, totalPrice })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDiscount(data.discountAmount);
        toast.success(`Promo applied! Discount: ₹${data.discountAmount.toFixed(2)}`);
      } else {
        toast.error(data.message || 'Invalid promo code');
        setDiscount(0);
      }
    } catch (error) {
      toast.error('Failed to validate promo code');
      setDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  if (loading) {
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

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <div className="max-w-md mx-auto text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="heading-1 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-700 font-semibold flex items-center space-x-1 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              const itemPrice = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;
              const itemTotal = itemPrice * item.quantity;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out p-5"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={product.images?.[0]?.url || '/api/placeholder/150/150'}
                        alt={product.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                        <div className="flex-1">
                          <Link
                            to={`/products/${product._id}`}
                            className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                          >
                            {product.name}
                          </Link>
                          {product.brand && (
                            <p className="text-sm text-gray-500 mt-1 bg-gradient-to-r from-gray-500 to-gray-400 text-transparent bg-clip-text">
                              {product.brand}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(product._id, product.name)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{itemPrice.toFixed(2)}
                          </span>
                          {product.discount > 0 && (
                            <div>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.price.toFixed(2)}
                              </span>
                              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-md">
                                -{product.discount}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="px-4 py-2 font-semibold text-gray-800 border-l border-r border-gray-300">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                            disabled={item.quantity >= product.stock}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Item Total</p>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= product.stock && (
                        <p className="text-sm text-red-500 font-medium mt-2 flex items-center space-x-1">
                          <span>Maximum quantity reached</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-200">
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Order Summary</h2>
              
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">
                      {totalPrice >= 50 ? 'FREE' : '₹5.00'}
                    </span>
                  </div>
                  {totalPrice < 50 && (
                    <p className="text-sm text-blue-500 mt-2 bg-blue-50 px-3 py-2 rounded-lg">
                      Add ₹{(50 - totalPrice).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="text-gray-600">Promo Discount</span>
                      <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{(totalPrice + (totalPrice >= 50 ? 0 : 5) - discount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <div>
                  <Link
                    to="/products"
                    className="block text-center text-blue-600 hover:text-blue-800 font-medium mt-4 transition-colors duration-300"
                  >
                    Continue Shopping
                  </Link>

                  {/* Promo Code */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-1">
                      <span>🎁</span>
                      <span>Have a Promo Code?</span>
                    </label>
                    <form onSubmit={handleApplyPromo} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="input flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm uppercase"
                      />
                      <button 
                        type="submit"
                        disabled={promoLoading || !promoCode.trim()}
                        className="btn btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promoLoading ? (
                          <span className="loading-spinner inline-block h-4 w-4"></span>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </form>
                    {discount > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Promo code applied successfully!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Cart;
