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
  Edit,
  Trash2,
  UserPlus,
  Shield,
  User,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  
  // State for pagination and filters
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Form state for user creation/editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });

  // Fetch users with filters
  const { data, isLoading, error } = useQuery(
    ['adminUsers', page, limit, searchTerm, role],
    async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (searchTerm) params.append('search', searchTerm);
      if (role) params.append('role', role);
      
      const response = await axios.get(`/api/users?${params.toString()}`, getAuthHeaders());
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  // Create user mutation
  const createUserMutation = useMutation(
    async (userData) => {
      const response = await axios.post('/api/users', userData, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User created successfully');
        setShowUserModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create user');
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    async ({ userId, userData }) => {
      const response = await axios.put(`/api/users/${userId}`, userData, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User updated successfully');
        setShowUserModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    async (userId) => {
      const response = await axios.delete(`/api/users/${userId}`, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation(
    async ({ userId, isActive }) => {
      const response = await axios.patch(`/api/users/${userId}/status`, { isActive }, getAuthHeaders());
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user status');
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
    setRole('');
    setPage(1);
  };

  // Open modal for creating a new user
  const openCreateUserModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true
    });
    setIsNewUser(true);
    setCurrentUser(null);
    setShowUserModal(true);
  };

  // Open modal for editing a user
  const openEditUserModal = (user) => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Don't populate password for security
      role: user.role || 'user',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setIsNewUser(false);
    setCurrentUser(user);
    setShowUserModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmitUser = (e) => {
    e.preventDefault();
    
    // Remove password if it's empty and we're updating
    const userData = { ...formData };
    if (!isNewUser && !userData.password) {
      delete userData.password;
    }
    
    if (isNewUser) {
      createUserMutation.mutate(userData);
    } else if (currentUser) {
      updateUserMutation.mutate({ userId: currentUser._id, userData });
    }
  };

  // Handle user deletion
  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Toggle user active status
  const toggleUserStatus = (userId, currentStatus, userName) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      toggleUserStatusMutation.mutate({ userId, isActive: newStatus });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-1">User Management</h1>
        <button 
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          onClick={openCreateUserModal}
        >
          <UserPlus size={20} />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
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
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">
              Apply Filters
            </button>
            {(searchTerm || role) && (
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle size={40} className="mx-auto mb-2" />
            <p>Error loading users. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.users.length > 0 ? (
                    data.users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {user._id.substring(user._id.length - 6).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isActive, `${user.firstName} ${user.lastName}`)}
                              className={`p-1 rounded-full ${
                                user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-50"
                              title="Edit User"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                              className="p-1 rounded-full text-red-600 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No users found. Try adjusting your filters.
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
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.totalUsers)} of {data.pagination.totalUsers} users
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

      {/* User Create/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isNewUser ? 'Create New User' : 'Edit User'}
                </h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  onClick={() => setShowUserModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-8">
              
              <form onSubmit={handleSubmitUser}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field w-full pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {isNewUser ? 'Password' : 'Password (leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      required={isNewUser}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active Account
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
                  >
                    {createUserMutation.isLoading || updateUserMutation.isLoading ? 'Saving...' : 'Save User'}
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

export default AdminUsers;