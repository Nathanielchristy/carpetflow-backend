import express from 'express';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import Invoice from '../models/Invoice.js';
import StockMovement from '../models/StockMovement.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userLocation = req.user.location;
    const locationQuery = userLocation === 'all' ? {} : { location: userLocation };

    const totalCustomers = await Customer.countDocuments(locationQuery);
    const totalInventory = await Inventory.countDocuments(locationQuery);
    const totalInvoices = await Invoice.countDocuments(locationQuery);

    const invoiceStats = await Invoice.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          paidInvoices: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          unpaidInvoices: { $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] } },
        },
      },
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyRevenueData = await Invoice.aggregate([
      {
        $match: {
          ...locationQuery,
          status: 'paid',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    const pendingInvoices = await Invoice.countDocuments({
      ...locationQuery,
      status: { $in: ['unpaid', 'partially_paid', 'sent'] },
    });

    const inventoryValue = await Inventory.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } }
        }
      }
    ]);

    const lowStockItems = await Inventory.countDocuments({
      ...locationQuery,
      $expr: { $lte: ['$stockQuantity', '$minimumStock'] },
    });

    const recentActivities = await StockMovement.find(locationQuery).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalInventory,
        totalInvoices,
        totalSales: invoiceStats[0]?.totalSales || 0,
        paidInvoices: invoiceStats[0]?.paidInvoices || 0,
        unpaidInvoices: invoiceStats[0]?.unpaidInvoices || 0,
        monthlyRevenue: monthlyRevenueData[0]?.total || 0,
        pendingInvoices,
        inventoryValue: inventoryValue[0]?.totalValue || 0,
        lowStockItems,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
