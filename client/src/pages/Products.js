import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const page = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const featured = searchParams.get('featured') || '';

  const { data, isLoading, isError } = useQuery(
    ['products', page, category, minPrice, maxPrice, search, sortBy, sortOrder, featured],
    () => {
      const params = new URLSearchParams();
      params.append('page', page);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (search) params.append('search', search);
      if (featured) params.append('featured', featured);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      return axios.get(`/api/products?${params.toString()}`).then(res => res.data);
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 when filters change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || minPrice || maxPrice || search || featured;

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'toys', label: 'Toys' },
    { value: 'other', label: 'Other' },
  ];

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Newest First' },
    { value: 'createdAt:asc', label: 'Oldest First' },
    { value: 'price:asc', label: 'Price: Low to High' },
    { value: 'price:desc', label: 'Price: High to Low' },
    { value: 'name:asc', label: 'Name: A to Z' },
    { value: 'name:desc', label: 'Name: Z to A' },
  ];

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split(':');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('sortOrder', newSortOrder);
    setSearchParams(newParams);
  };

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Products</h1>
          {search && (
            <p className="text-gray-600">
              Showing results for "{search}"
            </p>
          )}
          {data && (
            <p className="text-gray-600">
              {data.pagination.totalProducts} products found
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn btn-outline w-full mb-4 flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  Active
                </span>
              )}
            </button>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Clear all filters</span>
                </button>
              )}

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat.value}
                        onChange={() => updateFilter('category', cat.value)}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-gray-700">{cat.label}</span>
                    </label>
                  ))}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={!category}
                      onChange={() => updateFilter('category', '')}
                      className="form-radio text-blue-600"
                    />
                    <span className="text-gray-700">All Categories</span>
                  </label>
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      placeholder="$0"
                      className="input w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      placeholder="$9999"
                      className="input w-full"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Filter */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured === 'true'}
                    onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="text-gray-700 font-medium">Featured Products Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {data ? `Page ${data.pagination.currentPage} of ${data.pagination.totalPages}` : ''}
              </p>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input py-2"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
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
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load products. Please try again.</p>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !isError && data && (
              <>
                {data.products.length > 0 ? (
                  <div className="grid-responsive">
                    {data.products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No products found.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="btn btn-outline"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => updateFilter('page', page - 1)}
                      disabled={!data.pagination.hasPrev}
                      className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(data.pagination.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === data.pagination.totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => updateFilter('page', pageNum)}
                              className={`px-4 py-2 rounded-lg font-medium ${
                                pageNum === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === page - 2 ||
                          pageNum === page + 2
                        ) {
                          return <span key={pageNum} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => updateFilter('page', page + 1)}
                      disabled={!data.pagination.hasNext}
                      className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
