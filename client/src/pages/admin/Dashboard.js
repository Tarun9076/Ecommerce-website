import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, ShoppingBag, Users, Package } from 'react-feather';

// Authentication helper
const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Dashboard stat card component
const StatCard = ({ title, value, icon, change, loading, currency }) => {
  const Icon = icon;
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mt-1"></div>
          ) : (
            <p className="text-2xl font-semibold mt-1">
              {currency && '₹'}{value.toLocaleString()}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${loading ? 'bg-gray-100' : 'bg-blue-50'}`}>
          <Icon size={24} className={loading ? 'text-gray-400' : 'text-blue-500'} />
        </div>
      </div>
      
      {!loading && change !== undefined && (
        <div className="flex items-center mt-4">
          {isPositive ? (
            <ArrowUp size={16} className="text-green-500 mr-1" />
          ) : (
            <ArrowDown size={16} className="text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
          </span>
          <span className="text-sm text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/dashboard/stats', getAuthHeaders());
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection and permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={dashboardData?.revenueStats?.totalRevenue || 0} 
          icon={DollarSign} 
          change={10} 
          loading={loading}
          currency={true}
        />
        <StatCard 
          title="Total Orders" 
          value={dashboardData?.orderStats?.totalOrders || 0} 
          icon={ShoppingBag} 
          change={5} 
          loading={loading}
        />
        <StatCard 
          title="Total Users" 
          value={dashboardData?.userStats?.totalUsers || 0} 
          icon={Users} 
          change={8} 
          loading={loading}
        />
        <StatCard 
          title="Total Products" 
          value={dashboardData?.productStats?.totalProducts || 0} 
          icon={Package} 
          change={-3} 
          loading={loading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend (Last 30 Days)</h2>
        {loading ? (
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={dashboardData?.revenueStats?.dailyRevenue?.map(item => ({
                date: item._id,
                revenue: item.revenue
              })) || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                stroke="#0088FE" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue by Category</h2>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.revenueStats?.revenueByCategory?.map((item, index) => ({
                    name: item._id,
                    value: item.revenue
                  })) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(dashboardData?.revenueStats?.revenueByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Distribution</h2>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData?.orderStats?.orderStatusDistribution?.map(item => ({
                  status: item._id,
                  count: item.count
                })) || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity & Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Top Selling Products</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(dashboardData?.productStats?.topSellingProducts || []).slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.totalSold} sold · {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">User Registration</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={dashboardData?.userStats?.userRegistrationByMonth || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="New Users" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;