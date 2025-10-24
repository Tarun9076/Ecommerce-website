const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard/stats', auth, adminAuth, async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Start of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Start of previous month
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    
    // Last 7 days
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Order stats
    const totalOrders = await Order.countDocuments();
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Revenue stats
    const allOrders = await Order.find({
      status: { $ne: 'cancelled' }
    });
    
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    
    const ordersThisMonthData = await Order.find({
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'cancelled' }
    });
    
    const revenueThisMonth = ordersThisMonthData.reduce((sum, order) => sum + order.total, 0);
    
    // Product stats
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ 
      countInStock: { $lt: 10 } 
    });

    // Get daily revenue for the last 30 days
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);
    
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
          },
          revenue: { $sum: "$total" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get revenue by category
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $group: {
          _id: "$productInfo.category",
          revenue: { 
            $sum: { $multiply: ["$items.price", "$items.quantity"] } 
          }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      userStats: {
        totalUsers,
        newUsersThisMonth
      },
      orderStats: {
        totalOrders,
        ordersThisMonth,
        orderStatusDistribution
      },
      revenueStats: {
        totalRevenue,
        revenueThisMonth,
        dailyRevenue,
        revenueByCategory
      },
      productStats: {
        totalProducts,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products/stats
// @desc    Get product statistics
// @access  Private (Admin only)
router.get('/products/stats', auth, adminAuth, async (req, res) => {
  try {
    // Top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          name: "$productInfo.name",
          image: { $arrayElemAt: ["$productInfo.images", 0] },
          totalSold: 1,
          revenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      topSellingProducts,
      productsByCategory
    });
  } catch (error) {
    console.error('Product stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/users/stats', auth, adminAuth, async (req, res) => {
  try {
    // User registration over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userRegistrationByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format the results for easier frontend consumption
    const formattedUserRegistration = userRegistrationByMonth.map(item => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count
      };
    });

    // Active vs inactive users
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      userRegistrationByMonth: formattedUserRegistration,
      userStatus: [
        { name: 'Active', value: activeUsers },
        { name: 'Inactive', value: inactiveUsers }
      ],
      usersByRole
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;