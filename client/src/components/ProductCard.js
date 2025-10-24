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
      stars.push(<Star key={i} className="star" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="star" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star-empty" />);
    }

    return stars;
  };

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <Link to={`/products/${product._id}`} className="product-card group">
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/api/placeholder/300/300'}
          alt={product.name}
          className="product-image group-hover:scale-105 transition-transform duration-200"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            -{product.discount}%
          </div>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 text-gray-600" />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
          {product.name}
        </h3>
        
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        )}
        
        <div className="rating mb-2">
          {renderStars(product.averageRating)}
          <span className="text-sm text-gray-500 ml-1">
            ({product.totalReviews})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="price">
              ₹{discountedPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="price-original">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {product.stock > 0 && (
            <span className="text-sm text-green-600 font-medium">
              In Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
