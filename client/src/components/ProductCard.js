import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      toast.success('Added to cart!');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={i} 
          className="star w-4 h-4 text-yellow-400 fill-yellow-400 transition-transform duration-300 hover:scale-110" 
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star 
          key="half" 
          className="star w-4 h-4 text-yellow-400 fill-yellow-400" 
          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' }} 
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className="star-empty w-4 h-4 text-gray-300 fill-gray-300" 
        />
      );
    }

    return stars;
  };

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <Link to={`/products/${product._id}`} className="product-card group h-full">
      <div className="relative overflow-hidden flex flex-col h-full">
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          <img
            src={product.images?.[0]?.url || `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
              -{product.discount}%
            </div>
          )}
          
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-5 w-5 animate-fadeInUp" />
          </button>
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <span className="text-white font-bold text-lg bg-red-600 px-5 py-2 rounded-full shadow-lg animate-pulse">Out of Stock</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-bold mb-3 text-lg line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </h3>
        
        {product.brand && (
          <p className="text-sm font-medium mb-3 text-blue-600">
            {product.brand}
          </p>
        )}
        
        <div className="rating mb-4 group/rating">
          <div className="flex items-center space-x-0.5 group-hover/rating:animate-fadeInUp transition-all duration-300">
            {renderStars(product.averageRating)}
            <span className="text-xs text-gray-600 ml-2 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
              {product.totalReviews || 0}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="price text-xl">
              ₹{discountedPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="price-original text-sm">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {product.stock > 0 ? (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full shadow-sm border border-green-200">
              In Stock
            </span>
          ) : (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full shadow-sm border border-red-200">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
