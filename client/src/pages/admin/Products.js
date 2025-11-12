import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    images: [{ url: '', alt: '' }],
    isFeatured: false,
    discount: 0
  });

  // Categories from the Product model
  const categories = [
    'electronics', 
    'clothing', 
    'books', 
    'home', 
    'sports', 
    'beauty', 
    'toys', 
    'other'
  ];

  // Fetch products with filters
  const { data, isLoading, error } = useQuery(
    ['adminProducts', page, limit, searchTerm, category],
    async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      
      const response = await axios.get(`/api/products?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  // Create product mutation
  const createMutation = useMutation(
    async (productData) => {
      const response = await axios.post('/api/products', productData, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        setShowAddModal(false);
        resetForm();
        toast.success('Product created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      }
    }
  );

  // Update product mutation
  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await axios.put(`/api/products/${id}`, data, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        setShowEditModal(false);
        resetForm();
        toast.success('Product updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  // Delete product mutation
  const deleteMutation = useMutation(
    async (id) => {
      const response = await axios.delete(`/api/products/${id}`, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle image input changes
  const handleImageChange = (index, field, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = {
      ...updatedImages[index],
      [field]: value
    };
    setFormData({ ...formData, images: updatedImages });
  };

  // Add new image field
  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', alt: '' }]
    });
  };

  // Remove image field
  const removeImageField = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      images: [{ url: '', alt: '' }],
      isFeatured: false,
      discount: 0
    });
    setCurrentProduct(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      discount: parseInt(formData.discount)
    };
    
    if (currentProduct) {
      updateMutation.mutate({ id: currentProduct._id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  // Open edit modal with product data
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      images: product.images.length > 0 ? product.images : [{ url: '', alt: '' }],
      isFeatured: product.isFeatured || false,
      discount: product.discount || 0
    });
    setShowEditModal(true);
  };

  // Handle delete product
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setPage(1);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-1">Product Management</h1>
        <button 
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
            {(searchTerm || category) && (
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

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={40} className="mx-auto mb-2" />
            <p>Error loading products. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Featured</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.products.length > 0 ? (
                    data.products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                            {product.images && product.images[0] ? (
                              <img 
                                src={product.images[0].url} 
                                alt={product.images[0].alt || product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {product.description.substring(0, 50)}...
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">₹{product.price.toFixed(2)}</div>
                          {product.discount > 0 && (
                            <div className="text-xs text-green-600">
                              {product.discount}% off
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.isFeatured ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <X size={18} className="text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              onClick={() => handleDelete(product._id, product.name)}
                            >
                              <Trash2 size={18} />
                            </button>
                            <Link 
                              to={`/products/${product._id}`} 
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              target="_blank"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No products found. Try adjusting your filters or add a new product.
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
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.totalProducts)} of {data.pagination.totalProducts} products
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-8 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-8">
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="input-field min-h-[100px]"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="input-field"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      className="input-field"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="input-field"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      className="input-field"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      className="input-field"
                      value={formData.discount}
                      onChange={handleChange}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-gray-700">
                      Featured Product
                    </label>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="form-label">Images</label>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Image URL"
                            className="input-field"
                            value={image.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Alt Text"
                            className="input-field"
                            value={image.alt}
                            onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-outline p-2"
                          onClick={() => removeImageField(index)}
                          disabled={formData.images.length === 1}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-outline flex items-center gap-1"
                      onClick={addImageField}
                    >
                      <Plus size={16} /> Add Image
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={createMutation.isLoading}
                  >
                    {createMutation.isLoading ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-8 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-8">
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="input-field min-h-[100px]"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="input-field"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      className="input-field"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="input-field"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      className="input-field"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      className="input-field"
                      value={formData.discount}
                      onChange={handleChange}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-gray-700">
                      Featured Product
                    </label>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="form-label">Images</label>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Image URL"
                            className="input-field"
                            value={image.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Alt Text"
                            className="input-field"
                            value={image.alt}
                            onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-outline p-2"
                          onClick={() => removeImageField(index)}
                          disabled={formData.images.length === 1}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-outline flex items-center gap-1"
                      onClick={addImageField}
                    >
                      <Plus size={16} /> Add Image
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
