const mongoose = require('mongoose');
const { User } = require('../model/User.model');
const Orders = require('../model/Orders.model');
const Product = require('../model/Product.model');

const getTotalUsers = async () => {
  return await User.countDocuments({});
};

const getTotalOrders = async () => {
  return await Orders.countDocuments({});
};

const getTotalRevenue = async () => {
  const result = await Orders.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
  ]);
  return result[0]?.totalRevenue || 0;
};

const getOrderStatusBreakdown = async () => {
  return await Orders.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
  ]);
};

const getProductCounts = async () => {
  return await Product.countDocuments({});
};

const getDashboardData = async (req, res) => {
  try {
    const totalUsers = await getTotalUsers();
    const totalOrders = await getTotalOrders();
    const totalRevenue = await getTotalRevenue();
    const orderStatusBreakdown = await getOrderStatusBreakdown();
    const productCounts = await getProductCounts();

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue,
      orderStatusBreakdown,
      productCounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

module.exports = { getDashboardData };
