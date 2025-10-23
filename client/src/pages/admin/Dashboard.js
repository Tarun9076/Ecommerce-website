import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Authentication Placeholder ---
// In a real app, you'd get this from your auth context
const getAuthToken = () => {
  const token = localStorage.getItem('token'); 
  return token;
};

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`
  }
});
// ------------------------------

// A simple component for the stat cards
const StatCard = ({ title, value, loading }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    {loading ? (
      <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
    ) : (
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const res = await axios.get('/api/users/stats/overview', getAuthHeaders());
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Are you logged in as an admin?');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Section */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">User Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} loading={loadingStats} />
        <StatCard title="Active Users" value={stats.activeUsers} loading={loadingStats} />
        <StatCard title="Admin Users" value={stats.adminUsers} loading={loadingStats} />
        <StatCard title="New Users (This Month)" value={stats.newUsersThisMonth} loading={loadingStats} />
      </div>

      {/* You can add links to other admin sections here */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="flex gap-4">
          <a href="/admin/users" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Manage Users
          </a>
          <a href="/admin/products" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Manage Products
          </a>
          <a href="/admin/orders" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Manage Orders
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;